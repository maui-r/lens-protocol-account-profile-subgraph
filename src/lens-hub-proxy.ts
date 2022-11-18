import { Address, BigInt, log, store } from '@graphprotocol/graph-ts'
import { Followed, FollowNFTTransferred } from '../generated/LensHub Proxy/LensHub'
import { Account, AccountProfile, Profile } from '../generated/schema'

const ZERO_ADDRESS_STRING = '0x0000000000000000000000000000000000000000'
const ZERO_ADDRESS = Address.fromString(ZERO_ADDRESS_STRING)

export function handleFollowed(event: Followed): void {
  let follower = event.params.follower
  let profileIds = event.params.profileIds

  createAccount(follower)

  for (var i = 0; i < profileIds.length; i++) {
    let profileId = toEvenLengthHexString(profileIds[i])
    createProfile(profileId)
    createOrUpdateAccountProfile(follower, profileId)
  }
}

export function handleFollowNFTTransferred(event: FollowNFTTransferred): void {
  let oldFollower = event.params.from
  let newFollower = event.params.to
  if (oldFollower == newFollower) return

  let profileId = toEvenLengthHexString(event.params.profileId)

  if (oldFollower == ZERO_ADDRESS) {
    log.debug('{} followed {} SKIPPED', [newFollower.toHexString(), profileId])
    return
  }

  deleteOrUpdateAccountProfile(oldFollower, profileId)

  if (newFollower == ZERO_ADDRESS) {
    log.debug('{} burned {} Follow NFT', [oldFollower.toHexString(), profileId])
    return
  } else {
    log.debug('{} sent {} FollowNFT', [oldFollower.toHexString(), profileId])
  }

  createAccount(newFollower)
  createOrUpdateAccountProfile(newFollower, profileId)
}

function createAccount(accountId: Address): void {
  let account = Account.load(accountId)
  if (!account) {
    account = new Account(accountId)
    account.save()
  }
}

function createProfile(profileId: string): void {
  let profile = Profile.load(profileId)
  if (!profile) {
    profile = new Profile(profileId)
    profile.save()
  }
}

function createOrUpdateAccountProfile(accountId: Address, profileId: string): void {
  let accountProfileId = accountId.toHexString().concat(profileId)
  let accountProfile = AccountProfile.load(accountProfileId)
  if (accountProfile) {
    // increment amount
    accountProfile.amount = accountProfile.amount + 1
  } else {
    // create new AccountProfile
    accountProfile = new AccountProfile(accountProfileId)
    accountProfile.account = accountId
    accountProfile.profile = profileId
    accountProfile.amount = 1
  }
  accountProfile.save()
}

function deleteOrUpdateAccountProfile(accountId: Address, profileId: string): void {
  let oldAccountProfileId = accountId.toHexString().concat(profileId)
  let oldAccountProfile = AccountProfile.load(oldAccountProfileId)
  if (!oldAccountProfile) {
    log.warning('AccountProfile with id "{}" is expected to exist.', [oldAccountProfileId])
    return
  }
  if (oldAccountProfile.amount > 1) {
    // decrement amount
    oldAccountProfile.amount = oldAccountProfile.amount - 1
    oldAccountProfile.save()
  } else {
    // delete    
    store.remove('AccountProfile', oldAccountProfileId)
  }
}

function toEvenLengthHexString(number: BigInt): string {
  let hexString = number.toHexString()
  if (hexString.length % 2 != 0) {
    // insert a 0 after 0x to make string even length 
    hexString = hexString.slice(0, 2).concat('0').concat(hexString.slice(2))
  }
  return hexString
}