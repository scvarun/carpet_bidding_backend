import "reflect-metadata";
import * as tq from "type-graphql";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import { DateTimeResolver } from "graphql-scalars";
import { Context } from "./context";
import { GraphQLScalarType } from "graphql";
import config from "./config";
import { Connection, createConnection } from "typeorm";
import express from "express";
import * as http from "http";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { Media, User } from "./entity/internal";

import { UserTypeResolver } from "./resolvers/userType.resolver";
import { UserResolver } from "./resolvers/user.resolver";
import {
  CatalogueResolver,
  InventoryResolver,
} from "./resolvers/inventory.resolver";
import { NotificationService } from "./services/notifications.service";
import { MessageService } from "./services/messages.service";
import RedisClient from "./services/redis.service";
import { measureRequestDuration } from "./middlewares/resolveTimeMiddleware";
import { upload } from "./services/storage.service";
import { authMiddlewareApi } from "./middlewares/authMiddleware";
import { map } from "p-iteration";

import * as pug from "pug";
import * as path from "path";
import { CustomOrderResolver } from "./resolvers/customOrder.resolver";
import { DeliveryResolver } from "./resolvers/delivery.resolver";
import { ImporterResolver } from "./resolvers/importer.resolver";
import { MediaResolver } from "./resolvers/media.resolver";
import { MessageRoomResolver, MessageResolver } from "./resolvers/message.resolver";
import { NotificationResolver } from "./resolvers/notification.resolver";
import { OrderResolver } from "./resolvers/order.resolver";
import { OrderStatusHistoryResolver } from "./resolvers/orderHistory.resolver";
import { UserProfileResolver } from "./resolvers/userProfile.resolver";

const app = async () => {
  const corsOptions = {
    origin: "*",
  };

  const connection = await createConnection();

  const schema = await tq.buildSchema({
    resolvers: [
      UserTypeResolver,
      UserResolver,
      ImporterResolver,
      UserProfileResolver,
      CustomOrderResolver,
      InventoryResolver,
      CatalogueResolver,
      ImporterResolver,
      OrderResolver,
      OrderStatusHistoryResolver,
      MessageRoomResolver,
      MessageResolver,
      NotificationResolver,
      DeliveryResolver,
      MediaResolver,
    ],
    dateScalarMode: "isoDate",
    scalarsMap: [{ type: GraphQLScalarType, scalar: DateTimeResolver }],
  });

  const app = express();
  app.use(express.json());
  app.use(
    express.urlencoded({
      extended: true,
    })
  );
  app.use(measureRequestDuration);

  app.use((req: any, res: any, next) => {
    req.dbConnection = connection;
    next();
  });

  app.get("/", (req, res) => {
    return res.send(
      pug.renderFile(
        path.resolve(
          path.join(config.rootFolder, "/src/resources/views/home.pug")
        )
      )
    );
  });

  app.get("/privacy-policy", (req, res) => {
    return res.send(
      pug.renderFile(
        path.resolve(
          path.join(
            config.rootFolder,
            "/src/resources/views/privacy-policy.pug"
          )
        )
      )
    );
  });

  app.get("/terms", (req, res) => {
    return res.send(
      pug.renderFile(
        path.resolve(
          path.join(config.rootFolder, "/src/resources/views/terms.pug")
        )
      )
    );
  });

  app.get("/download", async (req, res) => {
    try {
      const filename = req.query.filename;
      if (typeof filename !== "string") throw new Error("Invalid filename");
      if (!filename)
        throw new Error("File expired. Please refresh and try again");
      const file = await RedisClient.instance().client.get(filename);
      if (!file) throw new Error("File not found");
      const download = Buffer.from(file, "base64");
      res.writeHead(200, {
        "Content-Disposition": "attachment;filename=" + filename,
        "Content-Type":
          "	application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      return res.end(download, "binary");
    } catch (e) {
      return res.status(401).send(e.message);
    }
  });

  app.post(
    "/upload",
    authMiddlewareApi,
    upload.array("media", 1),
    async (req: any, res) => {
      try {
        let media: any[] = req.files;
        let auth: User = req.auth;
        let dbConnection: Connection = req.dbConnection;
        let querun = dbConnection.createQueryRunner();
        let mediaObjs = await map(media, async (file) => {
          let m = new Media();
          m.awsKey = file.key;
          m.url = file.location;
          m.name = file.originalname;
          m.mimeType = file.mimetype;
          m.user = auth;
          m = await querun.manager.getRepository(Media).save(m);
          return m;
        });
        return res.json({
          media: mediaObjs,
        });
      } catch (e) {
        console.error(e);
        return res.status(401).send(e.message);
      }
    }
  );

  const httpServer = http.createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });
  const serverCleanup = useServer({ schema }, wsServer);

  const server = new ApolloServer({
    schema,
    context: ({ req }) => {
      const context: Context = {
        req,
        connection,
      };
      return context;
    },
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();
  server.applyMiddleware({ app, cors: corsOptions });

  httpServer.listen({ port: 80 }, () => {
    console.log(`🚀 Server ready at: http://localhost:${config.port}`);
    NotificationService.instance({ connection });
    MessageService.instance({ connection });
  });
};

app();
