import express from 'express';
import bodyParser from 'body-parser';
import { sessionMiddleware } from '../../server/utils/authentication';
import { extensions, extensionsInfo } from '../requireExtensions';
const router = express.Router(); //eslint-disable-line new-cap
const jsonParser = bodyParser.json({
  strict: false, //allow values other than arrays and objects
});

router.use(sessionMiddleware);

function searchString(id, str, max) {
  return new Promise((resolve, reject) => {
    if (id in extensions.search) {
      const mod = extensions.search[id];
      if (mod.search) {
        try {
          mod.search(str, max)
          .then(res => {
            resolve(res);
          })
          .catch(err => {
            reject(err.message);
          });
        } catch (err) {
          reject(err.message);
        }
      } else {
        reject('No search option named ' + id);
      }
    } else {
      reject('No search option named ' + id);
    }
  });
}

router.post('/:id', jsonParser, (req, resp) => {
  const { id } = req.params;
  const data = req.body;
  searchString(id, data.query, data.max)
  .then(res => {
    resp.json(res);
  })
  .catch(err => {
    resp.status(500).send(err);
  });
});

router.get('/manifests', jsonParser, (req, resp) => {
  resp.json(extensionsInfo.search);
});

//export these functions for testing purpose
router.searchString = searchString;

module.exports = router;
