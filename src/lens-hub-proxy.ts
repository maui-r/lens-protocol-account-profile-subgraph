import { Address, BigInt, log, store } from '@graphprotocol/graph-ts'
import { FollowNFTTransferred } from '../generated/LensHub Proxy/LensHub'
import { Account, AccountProfile, Profile } from '../generated/schema'

const ZERO_ADDRESS_STRING = '0x0000000000000000000000000000000000000000'
const ZERO_ADDRESS = Address.fromString(ZERO_ADDRESS_STRING)

export function handleFollowNFTTransferred(event: FollowNFTTransferred): void {
  let oldFollower = event.params.from
  let newFollower = event.params.to
  if (oldFollower == newFollower) return

  let profileId = toEvenLengthHexString(event.params.profileId)
  createProfile(profileId)

  if (oldFollower != ZERO_ADDRESS) {
    deleteOrUpdateAccountProfile(oldFollower, profileId)
  }

  if (newFollower == ZERO_ADDRESS) {
    log.debug('{} burned {} Follow NFT', [oldFollower.toHexString(), profileId])
    return
  }

  createAccount(newFollower)
  createOrUpdateAccountProfile(newFollower, profileId, event.params.timestamp)
  log.debug('{} FollowNFT transferred from {} to {}', [profileId, oldFollower.toHexString(), newFollower.toHexString()])
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

function createOrUpdateAccountProfile(accountId: Address, profileId: string, timestamp: BigInt): void {
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
    accountProfile.timestamp = timestamp
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