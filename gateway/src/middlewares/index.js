import compression from 'compression';
import helmet from 'helmet';

// Middlewares
import morgan from './morgan';
import cors from './cors';
import notFound from './notFound';
import language from './language';
import responseHandler from './responseHandler';
import errorHandler from './errorHandler';
// import discovery from './discovery';
import topLevelRoutes from './topLevelRoutes';

export default async function attachMiddleWares(app, server, args) {
  // trust proxy requests behind nginx.
  app.set('trust proxy', true);

  // attach res.respond and res.t
  app.use(responseHandler);
  app.use(language);

  app.use(compression());

  // logs every request
  app.use(morgan);

  // Set CORS
  cors(app);

  app.use(helmet());
  app.use(helmet.hidePoweredBy({ setTo: '' }));

  // proxy api routes
  // await discovery(app, args.protos);

  app.use('/', topLevelRoutes);

  app.use(notFound);
  app.use(errorHandler);
}