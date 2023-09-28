class DWebRecordType {
  value = -1;
  static ipfs = new DWebRecordType(0);
  static ipns = new DWebRecordType(1);
  constructor(value) {
    this.value = value;
  }
  toJSON() {
    return this.value;
  }
}

class DWebRecord {
  type;
  value;
  constructor(type, value) {
    this.DWebRecordType = DWebRecordType;
    this.type = type;
    this.value = value;
  }
}
class DotBitKit {
  static indexerURL = "https://indexer-v1.did.id";
  static accountInfoURL = `${DotBitKit.indexerURL}/v1/account/info`;
  static accountRecordsURL = `${DotBitKit.indexerURL}/v1/account/records`;
  async resolve(account) {
    const response = await fetch(DotBitKit.accountRecordsURL, {
      method: "POST",
      headers: { ContentType: "application/json" },
      body: JSON.stringify({
        account,
      }),
    });
    const json = await response.json();
    if (json && json.err_no == 0) {
      for (let record of json.data.records) {
        if (record.key.startsWith("dweb")) {
          if (record.key.endsWith("ipns")) {
            return new DWebRecord(DWebRecordType.ipns, record.value);
          } else if (record.key.endsWith("ipfs")) {
            return new DWebRecord(DWebRecordType.ipfs, record.value);
          }
        }
      }
    }
  }
}

module.exports = new DotBitKit();
