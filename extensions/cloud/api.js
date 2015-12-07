import express from 'express';
import bodyParser from 'body-parser';
import { runNode, getNodeDir, buildNodeContainer } from './cloudRun';
import { sessionMiddleware } from '../../server/authentication';

const mkpath = require('mkpath');
const fs = require('fs'), path = require('path');
const yaml = require('yamljs');
const readMultipleFiles = require('read-multiple-files');
const router = express.Router(); //eslint-disable-line new-cap
const jsonParser = bodyParser.json({
  strict: false, //allow values other than arrays and objects
});


/*
Helper
*/
function getDirectories(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
}

/*
Start building all docker containers before hand
*/
function startAllDockerBuildsAsync(dir) {
  var lst = getDirectories(dir);
  lst.forEach(
    function(id) {
      buildNodeContainer(id).then(result => {
        console.log("done building " + id);
      });
    }
  );

}

startAllDockerBuildsAsync("extensions/cloud"); //start loading

//router.use(sessionMiddleware);

router.post('/:id', jsonParser, (req, resp) => {
  const { id } = req.params;
  const inputs = req.body;
  const dir = getNodeDir(id) + "/";
  const key = req.headers["session-key"];
  var outputFiles = {};

  fs.readFile(dir + "workflow.yaml", "utf8", (err, filestr) => {
    
    if (err) {

      console.log("Workflow.yaml could not be read: " + err);

    } else {

      var data = yaml.parse(filestr);
      //var inputs = data.inputs;
      var outputs = data.outputs;
      var outputFileNames = [];
      var i,j;

      //inputs - write files using promises     
      var inputDirWrites = [];
      var inputFileWrites;

      //we need to provide a new session-key to all cloud-computes
      inputs.headers = JSON.stringify({"session-key":key});

      inputDirWrites = [
          new Promise((resolve, reject) => {
            mkpath(dir + "inputs/", (err) => {
              if (err) {
                reject(err.message);
              } else {
                resolve(dir + "inputs/");
              }
            })
          }),
          new Promise((resolve, reject) => {
            mkpath(dir + "outputs/", (err) => {
              if (err) {
                reject(err.message);
              } else {
                resolve(dir + "outputs/");
              }
            })
          })
        ];

      Promise.all(inputDirWrites).then(result => {

        for (var inputKey in inputs) {
          inputFileWrites.push(
            new Promise((resolve, reject) => {
              fs.writeFile( dir + "inputs/" + inputKey, inputs[inputKey] , err => {
                if (err) {
                  reject(err.message);
                } else {
                  resolve(dir + "inputs/" + inputKey);
                }
              }); //fs.writeFile
            }));
        }

        //outputs
        for (i=0; i < outputs.length; ++i) {
          outputFiles[ outputs[i].id ] = "";
          outputFileNames.push(dir + "outputs/" + outputs[i].id);
        }
      
        Promise.all(inputFileWrites).then(result => {
          if (!result) {
            console.log("Input write error");
          }

          //run the node
          runNode(id).then( res => {
            //read the output files

            readMultipleFiles(outputFileNames, "utf8", (err, buffers) => {


              if (err) {
                console.log("Output read error: " + err);
              }

              //get values from files into object
              //TODO - select only json-suitable output fields
              for (var i=0; i < outputFileNames.length; ++i) {
                outputFiles[ outputs[i].id ] = buffers[i];
              }

              //return object
              resp.json(outputFiles);

            }); //readMultipleFiles
          }); //runNode
        }); //writeFiles
      });
    }   //read yaml file successful
  }); //fs.readFile

}); //router.post


module.exports = router;
