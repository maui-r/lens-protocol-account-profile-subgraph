// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class FollowNFTTransferred extends ethereum.Event {
  get params(): FollowNFTTransferred__Params {
    return new FollowNFTTransferred__Params(this);
  }
}

export class FollowNFTTransferred__Params {
  _event: FollowNFTTransferred;

  constructor(event: FollowNFTTransferred) {
    this._event = event;
  }

  get profileId(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get followNFTId(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get from(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get to(): Address {
    return this._event.parameters[3].value.toAddress();
  }

  get timestamp(): BigInt {
    return this._event.parameters[4].value.toBigInt();
  }
}

export class LensHub extends ethereum.SmartContract {
  static bind(address: Address): LensHub {
    return new LensHub("LensHub", address);
  }
}
