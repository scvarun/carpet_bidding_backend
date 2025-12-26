import sgMail from '@sendgrid/mail';
import config from '../config';
sgMail.setApiKey(config.sendgridApiKey || '');
export default sgMail