import { Server } from "socket.io";
import express from 'express';
import { createServer } from "http";
import Connection from "./database/db.js";
import { getDocument,updateDocument } from "./controller/document-controller.js";

const PORT = process.env.PORT || 9000;

const URL= process.env.MONGODB_URI || `mongodb://apoorav711:apooravgdc7@google-docs-clone-shard-00-00.dkrtn.mongodb.net:27017,google-docs-clone-shard-00-01.dkrtn.mongodb.net:27017,google-docs-clone-shard-00-02.dkrtn.mongodb.net:27017/?ssl=true&replicaSet=atlas-yw4oxl-shard-0&authSource=admin&retryWrites=true&w=majority`;

Connection(URL);

const app =express();

if(process.env.NODE_ENV === 'production'){
  app.use(express.static('client/build'));
}

const httpServer = createServer(app);
httpServer.listen(PORT);

const io = new Server(httpServer);

io.on('connection',socket => {

  socket.on('get-document',async documentId =>{
    
   
    const document = await getDocument(documentId);
    socket.join(documentId);
    socket.emit('load-document',document.data);

    socket.on('send-changes',delta=>{
      socket.broadcast.to(documentId).emit('receive-changes',delta);
  })

    socket.on('save-document',async data =>{
      await updateDocument(documentId,data);
    })
  
  })
  
});