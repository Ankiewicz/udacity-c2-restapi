import express, { response } from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

//@ts-ignore
import detect from 'detect-file-type';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  app.get("/filteredimage", async ( req, res, next ) => {
    const acceptedImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
    let { image_url } = req.query;
    let imgResponse = await filterImageFromURL(image_url);

    
    detect.fromFile(imgResponse, (err: any, result: any) => {
      if (err) {
        console.error(err);
        res.send('Ops, something isn\'t working right');
      }

      if (acceptedImageTypes.includes(result.mime)) {
        res.sendFile(imgResponse, () => {
          deleteLocalFiles([imgResponse])
            .then(() => {
              next();
            })
            .catch((err)=> {
              console.error(err);
            });
        });
      } else {
        res.send('NOT AN IMAGE');
        deleteLocalFiles([imgResponse]);
      }
    });
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();