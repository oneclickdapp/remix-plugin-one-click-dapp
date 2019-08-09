import { compilerProfile } from './compiler';
import { filSystemProfile } from './file-system';
import { editorProfile } from './editor';
import { networkProfile } from './network';
import { udappProfile } from './udapp';
import { themeProfile } from './theme';
import { unitTestProfile } from './unit-testing';
import { contentImportProfile } from './content-import';
/** @deprecated Use remixProfiles instead. Will be remove in next version */
export const remixApi = Object.freeze({
    solidity: { ...compilerProfile, name: 'solidity' },
    fileManager: { ...filSystemProfile, name: 'fileManager' },
    solidityUnitTesting: { ...unitTestProfile, name: 'solidityUnitTesting' },
    editor: editorProfile,
    network: networkProfile,
    udapp: udappProfile,
    contentImport: contentImportProfile,
    theme: themeProfile,
});
/** Profiles of all the remix's Native Plugins */
export const remixProfiles = Object.freeze({
    solidity: { ...compilerProfile, name: 'solidity' },
    fileManager: { ...filSystemProfile, name: 'fileManager' },
    solidityUnitTesting: { ...unitTestProfile, name: 'solidityUnitTesting' },
    editor: editorProfile,
    network: networkProfile,
    udapp: udappProfile,
    contentImport: contentImportProfile,
    theme: themeProfile
});
