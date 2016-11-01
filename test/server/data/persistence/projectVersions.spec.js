/*
 Copyright 2016 Autodesk,Inc.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import { assert, expect } from 'chai';
import uuid from 'node-uuid';
import _ from 'lodash';
import { updateProjectWithTestAuthor } from '../../../_utils/userUtils';
import { testUserId } from '../../../constants';
import rollupFromArray from '../../../../src/utils/rollup/rollupFromArray';
import { errorInvalidModel, errorAlreadyExists, errorDoesNotExist } from '../../../../server/utils/errors';
import Project from '../../../../src/models/Project';
import Block from '../../../../src/models/Block';

import * as projectPersistence from '../../../../server/data/persistence/projects';
import * as projectVersions from '../../../../server/data/persistence/projectVersions';

describe('Server', () => {
  describe('Data', () => {
    describe('persistence', () => {
      describe('projectsVersions', () => {
        const projectName = 'persistenceProject';
        const projectData = Project.classless(updateProjectWithTestAuthor({ metadata: { name: projectName } }));
        const projectId = projectData.id;

        const blockName = 'blockA';
        const blockData = Block.classless({ projectId, metadata: { name: blockName } });
        const blockId = blockData.id;

        const roll = rollupFromArray(projectData, blockData);

        it('projectWrite() should create a version');

        it('projectWrite() should return version');

        it('projectGet() should get latest by default'); //compare to latest version

        it('projectVersionGet() should get a specific version');

        it('projectVersionList() should list versions');

        it('projectDelete() deletes all versions');
      });
    });
  });
});
