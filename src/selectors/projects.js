import * as blockSelectors from './blocks';

const _getProjectFromStore = (projectId, store) => {
  if (!projectId) {
    return null;
  }
  return store.projects[projectId];
};

export const projectGet = (projectId) => {
  return (dispatch, getState) => {
    return _getProjectFromStore(projectId, getState());
  };
};

//bit of a hack - expects focus section of store, and projectPage to have set it
export const projectGetCurrentId = () => {
  return (dispatch, getState) => {
    const { focus } = getState();
    return !!focus ? focus.projectId : null;
  };
};

export const projectGetVersion = (projectId) => {
  return (dispatch, getState) => {
    const project = _getProjectFromStore(projectId, getState());
    return !!project ? project.version : null;
  };
};

export const projectListAllComponents = (projectId) => {
  return (dispatch, getState) => {
    const project = _getProjectFromStore(projectId, getState());

    return project.components.reduce((acc, componentId) => {
      acc.push(dispatch(blockSelectors.blockGet(componentId)));
      const constructChildren = dispatch(blockSelectors.blockGetChildrenRecursive(componentId));
      acc.push(...constructChildren);
      return acc;
    }, []);
  };
};

export const projectListAllOptions = (projectId) => {
  return (dispatch, getState) => {
    const components = dispatch(projectListAllComponents(projectId));
    const optionIds = components.reduce((acc, comp) => acc.concat(Object.keys(comp.options)), []);
    return optionIds.map(id => dispatch(blockSelectors.blockGet(id)));
  };
};

//returns constructs first, then all blocks afterwards, order not guaranteed
export const projectListAllBlocks = (projectId) => {
  return (dispatch, getState) => {
    const components = dispatch(projectListAllComponents(projectId));
    const options = dispatch(projectListAllOptions(projectId));
    return components.concat(options);
  };
};

export const projectHasComponent = (projectId, blockId) => {
  return (dispatch, getState) => {
    const components = dispatch(projectListAllComponents(projectId));
    return components.map(comp => comp.id).includes(blockId);
  };
};

export const projectCreateRollup = (projectId) => {
  return (dispatch, getState) => {
    const project = _getProjectFromStore(projectId, getState());
    const blocks = dispatch(projectListAllBlocks(projectId));

    return {
      project,
      blocks,
    };
  };
};
