import * as ActionTypes from '../constants/ActionTypes';
import uuid from 'node-uuid';
import BlockDefinition from '../schemas/Block';
import { writeFile } from '../middleware/api';
import Block from '../models/Block';

export const blockCreate = (initialModel) => {
  return (dispatch, getState) => {
    const block = new Block(initialModel);

    return Promise.resolve(block)
      .then((block) => {
        dispatch({
          type: ActionTypes.BLOCK_CREATE,
          block,
        });
        return block;
      });
  };
};

//this action accepts either the block directly, or the ID
//inventory items may not be in the store, so we need to pass the block directly
export const blockClone = (blockInput) => {
  return (dispatch, getState) => {
    let oldBlock;
    if (typeof blockInput === 'string') {
      oldBlock = getState().blocks[blockInput];
    } else if (BlockDefinition.validate(blockInput)) {
      oldBlock = blockInput;
    } else {
      throw new Error('invalid input to blockClone', blockInput);
    }

    //hack - should hit the server
    const cloneStub = Object.assign({}, oldBlock, {
      id: uuid.v4(),
      parent: oldBlock.id,
    });

    return Promise.resolve(cloneStub)
      .then((block) => {
        dispatch({
          type: ActionTypes.BLOCK_CLONE,
          block,
        });
        return block;
      });
  };
};

export const blockSave = (blockId) => {
  return (dispatch, getState) => {
    const block = getState().blocks[blockId];
    return block.save()
      .then(response => response.json())
      .then(json => {
        dispatch({
          type: ActionTypes.BLOCK_SAVE,
          block,
        });
        return json;
      });
  };
};

//this is a backup for performing arbitrary mutations
export const blockMerge = (blockId, toMerge) => {
  return (dispatch, getState) => {
    const oldBlock = getState().blocks[blockId];
    const block = oldBlock.merge(toMerge);

    return Promise.resolve(block)
      .then((block) => {
        dispatch({
          type: ActionTypes.BLOCK_MERGE,
          block,
        });
        return block;
      });
  };
};

export const blockRename = (blockId, name) => {
  return (dispatch, getState) => {
    const oldBlock = getState().blocks[blockId];
    const block = oldBlock.mutate('metadata.name', name);

    return Promise.resolve(block)
      .then((block) => {
        dispatch({
          type: ActionTypes.BLOCK_RENAME,
          block,
        });
        return block;
      });
  };
};

export const blockAddComponent = (blockId, componentId, index) => {
  return (dispatch, getState) => {
    const oldBlock = getState().blocks[blockId];
    const block = oldBlock.addComponent(componentId, index);

    return Promise.resolve(block)
      .then((block) => {
        dispatch({
          type: ActionTypes.BLOCK_ADD_COMPONENT,
          block,
        });
        return block;
      });
  };
};

export const blockSetSbol = (blockId, sbol) => {
  return (dispatch, getState) => {
    const oldBlock = getState().blocks[blockId];
    const block = oldBlock.setSbol(sbol);

    return Promise.resolve(block)
      .then((block) => {
        dispatch({
          type: ActionTypes.BLOCK_SET_SBOL,
          block,
        });
        return block;
      });
  };
};

export const blockAnnotate = (blockId, annotation) => {
  return (dispatch, getState) => {
    const oldBlock = getState().blocks[blockId];
    const block = oldBlock.annotate(annotation);

    return Promise.resolve(block)
      .then((block) => {
        dispatch({
          type: ActionTypes.BLOCK_ANNOTATE,
          block,
        });
        return block;
      });
  };
};

export const blockRemoveAnnotation = (blockId, annotationId) => {
  return (dispatch, getState) => {
    const oldBlock = getState().blocks[blockId];
    const block = oldBlock.removeAnnotation(annotationId);

    return Promise.resolve(block)
      .then((block) => {
        dispatch({
          type: ActionTypes.BLOCK_REMOVE_ANNOTATION,
          block,
        });
        return block;
      });
  };
};

//future - also trigger some history actions
export const blockSetSequence = (blockId, sequence) => {
  return (dispatch, getState) => {
    const oldBlock = getState().blocks[blockId];
    // If we are editing the sequence, or sequence doesn't exist, we want to set the sequence for the child block, not change the sequence of the parent part.
    // When setting, it doesn't really matter, we just always want to set via filename which matches this block.
    const sequenceUrl = oldBlock.getSequenceUrl(true);

    return writeFile(sequenceUrl, sequence)
      .then(() => {
        const unannotated = oldBlock.mutate('sequence.annotations', []);
        const block = unannotated.setSequenceUrl(sequenceUrl);
        dispatch({
          type: ActionTypes.BLOCK_SET_SEQUENCE,
          block,
        });
        return block;
      });
  };
};
