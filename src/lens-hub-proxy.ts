import { BigInt } from "@graphprotocol/graph-ts"
import { FollowNFTTransferred as FollowNFTTransferred } from "../generated/LensHub Proxy/LensHub"
import { Account, Profile, FollowNFT } from "../generated/schema"

function toEvenLengthHexString(number: BigInt): string {
  let hexString = number.toHexString()
  if (hexString.length % 2 !== 0) {
    // insert a 0 after 0x to make string even length 
    hexString = hexString.slice(0, 2).concat("0").concat(hexString.slice(2))
  }
  return hexString
}

export function handleFollowNFTTransferred(event: FollowNFTTransferred): void {
  let to = event.params.to
  let profileId = toEvenLengthHexString(event.params.profileId)
  let followNFTId = toEvenLengthHexString(event.params.followNFTId)

  let account = Account.load(to)
  if (!account) {
    account = new Account(to)
    account.save()
  }

  let profile = Profile.load(profileId)
  if (!profile) {
    profile = new Profile(profileId)
    profile.save()
  }

  let followNFT = FollowNFT.load(followNFTId)
  if (!followNFT) {
    followNFT = new FollowNFT(followNFTId)
  }
  followNFT.owner = to
  followNFT.profile = profileId
  followNFT.timestamp = event.params.timestamp
  followNFT.save()
}