// @flow

import Version, { type VersionData } from './version';

// vector/list of versions of sites in the distributed system
// keeps track of the latest operation received from each site (i.e. version)
// prevents duplicate operations from being applied to our CRDT
class VersionVector {
  localVersion: Version;
  versions: Version[];

  // initialize empty vector to be sorted by siteId
  // initialize Version/Clock for local site and insert into versions vector object
  constructor(siteId: string) {
    this.localVersion = new Version(siteId);
    this.versions = [this.localVersion];
  }

  increment() {
    this.localVersion.counter += 1;
  }

  // updates vector with new version received from another site
  // if vector doesn't contain version, it's created and added to vector
  // create exceptions if need be.
  update(incomingVersion: VersionData) {
    const existingVersion = this.versions.find(
      version => incomingVersion.siteId === version.siteId,
    );

    if (!existingVersion) {
      const newVersion = new Version(incomingVersion.siteId);

      newVersion.update(incomingVersion);
      this.versions.push(newVersion);
    } else {
      existingVersion.update(incomingVersion);
    }
  }

  // check if incoming remote operation has already been applied to our crdt
  hasBeenApplied(incomingVersion: VersionData): boolean {
    const localIncomingVersion = this.getVersionFromVector(incomingVersion);

    if (!localIncomingVersion) return false;

    const isIncomingLower = incomingVersion.counter <= localIncomingVersion.counter;
    const isInExceptions = localIncomingVersion.exceptions.includes(incomingVersion.counter);

    return isIncomingLower && !isInExceptions;
  }

  getVersionFromVector(incomingVersion: VersionData): Version | void {
    return this.versions.find(version => version.siteId === incomingVersion.siteId);
  }

  getLocalVersion(): VersionData {
    const { siteId, counter } = this.localVersion;
    return { siteId, counter };
  }
}

export default VersionVector;
