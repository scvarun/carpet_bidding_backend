import { ApolloError } from "apollo-server";
import "reflect-metadata";
import { FindManyOptions, In, Like } from "typeorm";
import {
  Resolver,
  Query,
  Ctx,
  ObjectType,
  Field,
  ResolverInterface,
  FieldResolver,
  Root,
  UseMiddleware,
  Arg,
  Mutation,
  InputType,
} from "type-graphql";
import { Context } from "../context";
import {
  Importer,
  Inventory,
  InventoryTypes,
  Roll,
  Catalogue,
  UserTypes,
} from "../entity/internal";
import { AuthMiddleware } from "../middlewares/authMiddleware";
import { filter, forEach, map } from "p-iteration";
import { reduce } from "p-iteration";
import { QueryInput } from "../lib/queryInput";
import { PaginatedOutput } from "../lib/paginatedOutput";

@InputType()
class InventoryObject {
  @Field(() => InventoryTypes)
  type: InventoryTypes;

  @Field(() => [String])
  similarInventoryUUIDs: string[];

  @Field()
  quantity: number;

  @Field({ nullable: true })
  patternNo: string;
}

@InputType()
class InventoryAddInput {
  @Field()
  catalogueUUID: string;

  @Field(() => [String])
  importersUUID: string[];

  @Field(() => [InventoryObject])
  patterns: InventoryObject[];
}

@InputType()
class InventoryUpdateInput {
  @Field()
  inventoryUUID: string;

  @Field({ nullable: true })
  rate: string;

  @Field({ nullable: true })
  size: string;

  @Field({ nullable: true })
  patternNo?: string;

  @Field({ nullable: true })
  catalogName?: string;

  @Field()
  quantity: number;

  @Field(() => [String])
  importersUUID: string[];

  @Field(() => [String])
  similarInventoryUUIDs: string[];
}

@InputType()
class InventoryQueryInput extends QueryInput {
  @Field(() => InventoryTypes)
  type: InventoryTypes;
}

@InputType()
class CatalogueAddInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  rate: string;

  @Field({ nullable: true })
  size: string;
}

@ObjectType()
class InventoryCheckAvailabilityOutput {
  @Field()
  isAvailable: boolean;

  @Field()
  message: string;

  @Field(() => Inventory, { nullable: true })
  inventory: Inventory | null;
}

@ObjectType()
class InventoryListOutput extends PaginatedOutput {
  @Field(() => [Inventory])
  inventories: Inventory[];
}

@ObjectType()
class InventoryDeletedOutput {
  @Field()
  message: string;
}

@Resolver((of) => Inventory)
export class InventoryResolver implements ResolverInterface<Inventory> {
  @UseMiddleware(AuthMiddleware)
  @Query(() => [Catalogue])
  async catalogues(@Ctx() ctx: Context): Promise<Catalogue[]> {
    return await ctx.connection.getRepository(Catalogue).find({
      withDeleted: false,
      order: { createdAt: "DESC" },
    });
  }
  @UseMiddleware(AuthMiddleware)
  @Query(() => [Catalogue])
  async cataloguesWithInventory(
    @Arg("type") type: InventoryTypes,
    @Ctx() ctx: Context
  ): Promise<Catalogue[]> {
    let catalogues = await ctx.connection.getRepository(Catalogue).find({
      withDeleted: false,
      relations: ["inventories"],
      order: { createdAt: "DESC" },
    });
    catalogues = await filter(catalogues, async (e) => {
      let inventories = await e.inventories;
      if (!inventories) return false;
      let cataloguesWithAtleastOneItem = await filter(
        inventories,
        async (i) => {
          return i.type === type;
        }
      );
      return cataloguesWithAtleastOneItem.length > 1;
    });
    return catalogues;
  }

  @UseMiddleware(AuthMiddleware)
  @Query(() => InventoryListOutput)
  async inventories(
    @Arg("query") query: InventoryQueryInput,
    @Ctx() ctx: Context
  ): Promise<InventoryListOutput> {
    let options: FindManyOptions<Inventory> = {
      where: {
        type: query.type,
      },
      take: query.limit,
      skip: query.limit * (query.page - 1),
    };

    if (query.search && query.search.length > 3) {
      options = {
        where: [
          { type: query.type, catalogue: { name: Like(`%${query.search}%`) } },
          { type: query.type, roll: { patternNo: Like(`%${query.search}%`) } },
        ],
        take: query.limit,
        skip: query.limit * (query.page - 1),
        withDeleted: false,
        relations: ["importers", "catalogue", "roll"],
      };
    }

    const count = await ctx.connection.getRepository(Inventory).count({
      ...options,
    });

    const inventories = await ctx.connection.getRepository(Inventory).find({
      ...options,
      relations: ["importers", "catalogue", "roll"],
      order: {
        createdAt: "DESC",
      },
    });

    console.log(
      count,
      query.limit,
      Math.floor(count / query.limit),
      Math.ceil(count / query.limit)
    );

    return {
      inventories,
      page: query.page,
      perPage: query.limit,
      total: count,
      lastPage: Math.ceil(count / query.limit),
    };

    // let options: FindManyOptions<Inventory> = {
    //   where: { type: query.type },
    //   take: query.limit,
    //   skip: query.limit * (query.page - 1),
    //   relations: ["importers", "catalogue", "roll"],
    //   withDeleted: false,
    //   order: {
    //     createdAt: "DESC",
    //   },
    // };

    // let findQuery = ctx.connection.getRepository(Inventory)
    //   .createQueryBuilder('inventories')
    //   .andWhere('deletedAt IS NOT NULL')
    //   .orderBy('createdAt', 'DESC');

    // console.log('search query is: ', query);

    // if (query.search && query.search.length > 1) {
    //   let ids: number[] = [];
    //   if(query.type === 'rolls') {
    //     let rolls = await ctx.connection.getRepository(Roll).find({
    //       where: { patternNo: Like(`%${query.search}%`) },
    //       withDeleted: false,
    //       relations: ["inventory", "inventory.catalogue", "inventory.roll"],
    //       order: { createdAt: "DESC" },
    //     });
    //     console.log('rolls', rolls);
    //     ids = Array.from(new Set(rolls.map((e) => Number(e.inventoryId))));
    //   } else {
    //     let catalogs = await ctx.connection.getRepository(Catalogue).find({
    //       where: { name: Like(`%${query.search}%`) },
    //       relations: ["inventories"]
    //     });
    //     await Promise.all(catalogs.map(async (e) => {
    //       (await e.inventories)?.forEach(e => ids.push(e.id));
    //     }));
    //     console.log(catalogs);
    //     ids = Array.from(new Set(ids));
    //   }
    //   findQuery = findQuery.where('id', ids);
    // }

    // const count = await findQuery.getCount();
    // const results = await findQuery
    //   .take(query.limit)
    //   .skip(query.limit * (query.page - 1))
    //   .getMany();

    // const inventories = await ctx.connection.getRepository(Inventory).find({
    //   ...options,
    //   where: {
    //     type: query.type,
    //     id: query.search && query.search.length > 1 ? In(results.map((e) => e.id)) : undefined,
    //   }
    // });

    // return {
    //   inventories,
    //   page: query.page,
    //   perPage: query.limit,
    //   total: count,
    //   lastPage: Math.ceil(count / query.limit),
    // }
  }

  @UseMiddleware(AuthMiddleware)
  @Query(() => Inventory)
  async inventory(
    @Arg("uuid") uuid: string,
    @Ctx() ctx: Context
  ): Promise<Inventory> {
    const inventory = await ctx.connection.getRepository(Inventory).findOne({
      where: { uuid },
      withDeleted: false,
      relations: ["importers", "roll", "catalogue", "similarInventories"],
    });
    if (!inventory)
      throw new ApolloError("InventoryNotFound", "Inventory not found");
    return inventory;
  }

  @UseMiddleware(AuthMiddleware)
  @Query(() => Inventory, { nullable: true })
  async getInventorySuggestions(
    @Arg("text") text: String,
    @Ctx() ctx: Context
  ): Promise<Inventory | null> {
    let roll = await ctx.connection.getRepository(Roll).findOne({
      where: { patternNo: Like(`%${text}%`) },
      withDeleted: false,
      relations: ["inventory", "inventory.catalogue", "inventory.roll"],
      order: { createdAt: "DESC" },
    });
    return roll?.inventory ?? null;
  }

  @UseMiddleware(AuthMiddleware)
  @Query(() => [Inventory], { nullable: true })
  async getInventorySuggestionsList(
    @Arg("text") text: String,
    @Ctx() ctx: Context
  ): Promise<Inventory[]> {
    let rolls = await ctx.connection.getRepository(Roll).find({
      where: { patternNo: Like(`%${text}%`) },
      withDeleted: false,
      relations: ["inventory", "inventory.catalogue", "inventory.roll"],
      order: { createdAt: "DESC" },
    });
    let inventories = await map(rolls, async (e) => e.inventory);
    let i = inventories.reduce((a: Inventory[], e) => {
      if (e !== null) a.push(e);
      return a;
    }, []);
    return i;
  }

  @FieldResolver(() => [Importer], { nullable: true })
  async importers(@Root() inventory: Inventory): Promise<Importer[] | null> {
    return inventory.importers;
  }

  @FieldResolver(() => Catalogue, { nullable: true })
  async catalogue(@Root() inventory: Inventory): Promise<Catalogue | null> {
    return inventory.catalogue;
  }

  @FieldResolver(() => Roll, { nullable: true })
  async roll(@Root() inventory: Inventory): Promise<Roll | null> {
    return inventory.roll;
  }

  @FieldResolver(() => [Inventory], { nullable: true })
  async similarInventories(@Root() inventory: Inventory): Promise<Inventory[]> {
    return inventory.similarInventories ?? [];
  }

  @UseMiddleware(AuthMiddleware)
  @Mutation(() => [Inventory])
  async addInventories(
    @Arg("data") data: InventoryAddInput,
    @Ctx() ctx: Context
  ): Promise<Inventory[]> {
    const querun = ctx.connection.createQueryRunner();
    try {
      await querun.connect();
      await querun.startTransaction();
      const authUserType = await ctx.auth?.userType;
      if (authUserType?.slug !== UserTypes.admin) {
        throw new ApolloError("Not allowed to do this operation");
      }
      const catalogue = await querun.manager.getRepository(Catalogue).findOne({
        where: { uuid: data.catalogueUUID },
        relations: ["inventories", "inventories.importers"],
      });
      if (!catalogue)
        throw new ApolloError("CatalogueNotFound", "Catalogue not found");
      const importers = await querun.manager.getRepository(Importer).find({
        where: data.importersUUID.map((i) => ({ uuid: i })),
      });
      let inventories: Inventory[] = [];
      let inventoryRepo = querun.manager.getRepository(Inventory);
      let rollRepo = querun.manager.getRepository(Roll);
      for (let i = 0; i < data.patterns.length; i++) {
        if (data.patterns[i].type === InventoryTypes.catalog) {
          let count = await querun.manager.getRepository(Inventory).count({
            where: {
              catalogueId: catalogue.id,
              type: InventoryTypes.catalog,
            },
          });
          if (count > 0) {
            throw new ApolloError(
              "ValidationError: Catalog already exists for this catalogue",
              "ValidationError"
            );
          }
        } else if (data.patterns[i].type == InventoryTypes.rolls) {
          let count = await querun.manager.getRepository(Roll).count({
            where: {
              patternNo: data.patterns[i].patternNo,
            },
            withDeleted: false,
          });
          if (count > 0) {
            throw new ApolloError(
              "ValidationError: Roll already exists for this patternNo",
              "ValidationError"
            );
          }
        }

        let inventory = new Inventory();
        inventory.type = data.patterns[i].type;
        inventory.quantity = data.patterns[i].quantity;
        inventory.catalogueId = catalogue.id;
        inventory = await inventoryRepo.save(inventory);

        let similarInventories = await map(
          data.patterns[i].similarInventoryUUIDs,
          async (e) => {
            let i = await querun.manager.getRepository(Inventory).findOne({
              where: {
                uuid: e,
              },
            });
            if (i == null) throw new ApolloError("Similar inventory not found");
            return i;
          }
        );

        await forEach(similarInventories, async (s) => {
          await querun.manager.query(
            `INSERT INTO similarInventoryForInventories(similarInventoryId, inventoryId) VALUES(${s.id}, ${inventory.id})`
          );
        });

        if (inventory.type === InventoryTypes.rolls) {
          let roll = new Roll();
          roll.patternNo = data.patterns[i].patternNo;
          roll.inventoryId = inventory.id;
          await rollRepo.save(roll);
        }
        inventories.push(inventory);
      }

      if (data.patterns[0].type === InventoryTypes.catalog) {
        let catalogueInventories = (await catalogue.inventories) ?? [];
        let inventoriesIds = [...catalogueInventories, ...inventories].map(
          (e) => e.id
        );
        let importerValues = importers.reduce(
          (
            arr: {
              importerId: number;
              inventoryId: number;
            }[],
            c
          ) => {
            inventoriesIds.map((e) => {
              arr.push({ importerId: c.id, inventoryId: e });
            });
            return arr;
          },
          []
        );

        if (inventoriesIds.length) {
          await querun.manager.query(
            `DELETE FROM importerForInventories where inventoryId in (${inventoriesIds
              .map((e) => e.toString())
              .join(",")})`
          );
        }

        if (importerValues.length > 0) {
          let sql = importerValues
            .map((e) => `(${e.importerId}, ${e.inventoryId})`)
            .join(",");

          await querun.manager.query(
            `INSERT INTO importerForInventories(importerId, inventoryId) VALUES ${sql}`
          );
        }
      } else if (data.patterns[0].type === InventoryTypes.rolls) {
        let catalogInventory =
          (await catalogue.inventories)?.filter(
            (f) => f.type === InventoryTypes.catalog
          ) ?? [];
        if (catalogInventory.length > 0) {
          let importers = catalogInventory[0].importers ?? [];

          if (importers.length > 0) {
            let inventoriesIds = [...inventories].map((e) => e.id);
            let importerValues = importers.reduce(
              (
                arr: {
                  importerId: number;
                  inventoryId: number;
                }[],
                c
              ) => {
                inventoriesIds.map((e) => {
                  arr.push({ importerId: c.id, inventoryId: e });
                });
                return arr;
              },
              []
            );

            if (importerValues.length > 0) {
              let sql = importerValues
                .map((e) => `(${e.importerId}, ${e.inventoryId})`)
                .join(",");

              await querun.manager.query(
                `INSERT INTO importerForInventories(importerId, inventoryId) VALUES ${sql}`
              );
            }
          }
        }
      }

      await querun.commitTransaction();
      return inventories;
    } catch (e) {
      await querun.rollbackTransaction();
      throw e;
    } finally {
      await querun.release();
    }
  }

  @UseMiddleware(AuthMiddleware)
  @Mutation(() => Inventory)
  async updateInventories(
    @Arg("data") data: InventoryUpdateInput,
    @Ctx() ctx: Context
  ): Promise<Inventory> {
    const querun = ctx.connection.createQueryRunner();
    try {
      await querun.connect();
      await querun.startTransaction();
      const authUserType = await ctx.auth?.userType;
      if (authUserType?.slug !== UserTypes.admin) {
        throw new ApolloError("Not allowed to do this operation");
      }
      let inventory = await querun.manager.getRepository(Inventory).findOne({
        where: { uuid: data.inventoryUUID },
        relations: [
          "importers",
          "similarInventories",
          "catalogue",
          "catalogue.inventories",
          "roll",
        ],
      });
      if (!inventory) throw new ApolloError("inventory not found");
      inventory.quantity = data.quantity;
      if (inventory.type == InventoryTypes.rolls) {
        let roll = inventory.roll;
        if (!roll) throw new ApolloError("Roll not found");
        roll.patternNo = data.patternNo || roll?.patternNo;
        console.log(roll.patternNo);
        await querun.manager.save(roll);
        inventory.roll = roll;
      }
      await querun.manager.save(inventory);

      let importers: Importer[] = [];
      if (data.importersUUID.length) {
        importers = await querun.manager.getRepository(Importer).find({
          where: data.importersUUID.map((e) => ({ uuid: e })),
        });
      }

      let catalogue = inventory.catalogue;
      if (!catalogue) throw new ApolloError("Catalogue not found");
      catalogue.rate = data.rate || catalogue.rate;
      catalogue.size = data.size || catalogue.size;
      catalogue.name = data.catalogName || catalogue.name;
      await querun.manager.save(catalogue);

      if (inventory.type === InventoryTypes.catalog) {
        let catalogueInventories = (await catalogue.inventories) ?? [];
        let inventoriesIds = [...catalogueInventories, inventory].map(
          (e) => e.id
        );
        let importerValues = importers.reduce(
          (
            arr: {
              importerId: number;
              inventoryId: number;
            }[],
            c
          ) => {
            inventoriesIds.map((e) => {
              arr.push({ importerId: c.id, inventoryId: e });
            });
            return arr;
          },
          []
        );

        if (inventoriesIds.length) {
          await querun.manager.query(
            `DELETE FROM importerForInventories where inventoryId in (${inventoriesIds
              .map((e) => e.toString())
              .join(",")})`
          );
        }

        if (importerValues.length > 0) {
          let sql = importerValues
            .map((e) => `(${e.importerId}, ${e.inventoryId})`)
            .join(",");

          await querun.manager.query(
            `INSERT INTO importerForInventories(importerId, inventoryId) VALUES ${sql}`
          );
        }
      }

      let similarInventories: Inventory[] = [];
      if (data.similarInventoryUUIDs.length) {
        similarInventories = await querun.manager
          .getRepository(Inventory)
          .find({
            where: data.similarInventoryUUIDs.map((e) => ({ uuid: e })),
          });
      }

      await querun.manager.query(
        `DELETE FROM similarInventoryForInventories WHERE inventoryId = ${inventory.id}`
      );

      await forEach(similarInventories, async (i) => {
        await querun.manager
          .createQueryBuilder()
          .relation(Inventory, "similarInventories")
          .of({ id: inventory?.id })
          .add({
            id: i.id,
          });
      });

      await querun.commitTransaction();
      return inventory;
    } catch (e) {
      await querun.rollbackTransaction();
      throw e;
    } finally {
      await querun.release();
    }
  }

  @UseMiddleware(AuthMiddleware)
  @Mutation(() => InventoryDeletedOutput)
  async removeInventory(
    @Arg("uuid") uuid: string,
    @Ctx() ctx: Context
  ): Promise<InventoryDeletedOutput> {
    const querun = ctx.connection.createQueryRunner();
    try {
      await querun.connect();
      await querun.startTransaction();
      const authUserType = await ctx.auth?.userType;
      if (authUserType?.slug !== UserTypes.admin) {
        throw new ApolloError("Not allowed to do this operation");
      }
      let inventory = await querun.manager.getRepository(Inventory).findOne({
        where: { uuid },
        relations: [
          "roll",
          "importers",
          "similarInventories",
          "catalogue",
          "catalogue.inventories",
        ],
      });
      if (!inventory) throw new ApolloError("inventory not found");
      inventory.deletedAt = new Date();
      if (inventory.type === InventoryTypes.catalog) {
        const catalogue = inventory.catalogue;
        const inventories = (await catalogue?.inventories) ?? [];
        await Promise.all(
          inventories.map(async (i) => {
            i.deletedAt = new Date();
            const roll = i.roll;
            if (roll) {
              roll.patternNo =
                roll.patternNo + " - DELETED AT : " + new Date().getTime();
              await querun.manager.save(roll);
            }
            await querun.manager.save(i);
          })
        );
      } else {
        const roll = inventory.roll;
        if (roll) {
          roll.patternNo =
            roll.patternNo + " - DELETED AT : " + new Date().getTime();
          await querun.manager.save(roll);
        }
      }
      await querun.manager.save(inventory);
      await querun.commitTransaction();
      return {
        message: "Inventory deleted successfully",
      };
    } catch (e) {
      await querun.rollbackTransaction();
      throw e;
    } finally {
      await querun.release();
    }
  }

  @Query(() => InventoryCheckAvailabilityOutput)
  async checkAvailability(
    @Arg("catalogueUUID", { nullable: true }) catalogueUUID: string,
    @Arg("quantity") quantity: number,
    @Ctx() ctx: Context,
    @Arg("patternNo", { nullable: true }) patternNo?: string
  ): Promise<InventoryCheckAvailabilityOutput> {
    let inventories: Inventory[];
    if (patternNo !== null) {
      let rolls = await ctx.connection.getRepository(Roll).find({
        where: { patternNo },
        relations: ["inventory"],
      });
      inventories = await reduce(
        rolls,
        async (a: Inventory[], c: Roll) => {
          const i = c.inventory;
          if (i) a.push(i);
          return a;
        },
        []
      );
    } else {
      var catalogue = await ctx.connection.getRepository(Catalogue).findOne({
        where: {
          uuid: catalogueUUID,
        },
        relations: ["inventories", "inventories.roll"],
        withDeleted: false,
      });
      if (!catalogue || patternNo == null) {
        throw new ApolloError("CatalogueNotFound", "Catalogue not found");
      }
      inventories = (await catalogue.inventories) ?? [];
      inventories = await filter(inventories, async (e) => {
        return e.type == InventoryTypes.catalog;
      });
    }
    let inventory = inventories.length ? inventories[0] : null;
    let isAvailable = (inventory?.quantity ?? 0) >= quantity ?? false;
    return {
      inventory,
      message: isAvailable
        ? "Required quantity is available. You can order now."
        : "Required quantity is not available. You can send an enquiry.",
      isAvailable,
    };
  }
}

@Resolver((of) => Catalogue)
export class CatalogueResolver implements ResolverInterface<Catalogue> {
  @FieldResolver(() => [Inventory], { nullable: true })
  async inventories(@Root() root: Catalogue): Promise<Inventory[]> {
    return (await root.inventories) ?? [];
  }

  @UseMiddleware(AuthMiddleware)
  @Mutation(() => Catalogue)
  async addCatalogue(
    @Arg("data") data: CatalogueAddInput,
    @Ctx() ctx: Context
  ): Promise<Catalogue> {
    const querun = ctx.connection.createQueryRunner();
    try {
      await querun.connect();
      await querun.startTransaction();
      const authUserType = await ctx.auth?.userType;
      if (authUserType?.slug !== UserTypes.admin) {
        throw new ApolloError("Not allowed to do this operation");
      }
      let catalogue = new Catalogue();
      catalogue.name = data.name;
      catalogue.rate = data.rate;
      catalogue.size = data.size;
      catalogue = await querun.manager.getRepository(Catalogue).save(catalogue);
      await querun.commitTransaction();
      return catalogue;
    } catch (e) {
      await querun.rollbackTransaction();
      throw e;
    } finally {
      await querun.release();
    }
  }
}
