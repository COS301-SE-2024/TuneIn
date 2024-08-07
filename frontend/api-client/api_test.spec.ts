/**
 * TuneIn API
 * The API for the TuneIn application, handling all the backend logic and making it available to the frontend.
 *
 * OpenAPI spec version: 1.0
 * 
 *
 * NOTE: This file is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the file manually.
 */

import * as api from "./api"
import { Configuration } from "./configuration"

const config: Configuration = {}

describe("AuthApi", () => {
  let instance: api.AuthApi
  beforeEach(function() {
    instance = new api.AuthApi(config)
  });

  test("authControllerLogin", () => {
    const body: api.LoginBody = undefined
    return expect(instance.authControllerLogin(body, {})).resolves.toBe(null)
  })
  test("authControllerRegister", () => {
    const body: api.RegisterBody = undefined
    return expect(instance.authControllerRegister(body, {})).resolves.toBe(null)
  })
  test("spotifyAuthControllerHandleSpotifyAuthCallback", () => {
    const code: string = "code_example"
    return expect(instance.spotifyAuthControllerHandleSpotifyAuthCallback(code, {})).resolves.toBe(null)
  })
  test("spotifyAuthControllerHandleSpotifyRefresh", () => {
    return expect(instance.spotifyAuthControllerHandleSpotifyRefresh({})).resolves.toBe(null)
  })
})

describe("DefaultApi", () => {
  let instance: api.DefaultApi
  beforeEach(function() {
    instance = new api.DefaultApi(config)
  });

  test("appControllerGetHello", () => {
    return expect(instance.appControllerGetHello({})).resolves.toBe(null)
  })
  test("appControllerUploadFile", () => {
    return expect(instance.appControllerUploadFile({})).resolves.toBe(null)
  })
})

describe("RoomsApi", () => {
  let instance: api.RoomsApi
  beforeEach(function() {
    instance = new api.RoomsApi(config)
  });

  test("roomsControllerAddSongToQueue", () => {
    const body: string = undefined
    const roomID: string = "roomID_example"
    return expect(instance.roomsControllerAddSongToQueue(body, roomID, {})).resolves.toBe(null)
  })
  test("roomsControllerBookmarkRoom", () => {
    const roomID: string = "roomID_example"
    return expect(instance.roomsControllerBookmarkRoom(roomID, {})).resolves.toBe(null)
  })
  test("roomsControllerClearRoomQueue", () => {
    const roomID: string = "roomID_example"
    return expect(instance.roomsControllerClearRoomQueue(roomID, {})).resolves.toBe(null)
  })
  test("roomsControllerDeleteRoom", () => {
    const roomID: string = "roomID_example"
    return expect(instance.roomsControllerDeleteRoom(roomID, {})).resolves.toBe(null)
  })
  test("roomsControllerGetCurrentSong", () => {
    const roomID: string = "roomID_example"
    return expect(instance.roomsControllerGetCurrentSong(roomID, {})).resolves.toBe(null)
  })
  test("roomsControllerGetLiveChatHistory", () => {
    const roomID: string = "roomID_example"
    return expect(instance.roomsControllerGetLiveChatHistory(roomID, {})).resolves.toBe(null)
  })
  test("roomsControllerGetNewRooms", () => {
    const none: any = undefined
    return expect(instance.roomsControllerGetNewRooms(none, {})).resolves.toBe(null)
  })
  test("roomsControllerGetRoomInfo", () => {
    const roomID: string = "roomID_example"
    return expect(instance.roomsControllerGetRoomInfo(roomID, {})).resolves.toBe(null)
  })
  test("roomsControllerGetRoomQueue", () => {
    const roomID: string = "roomID_example"
    return expect(instance.roomsControllerGetRoomQueue(roomID, {})).resolves.toBe(null)
  })
  test("roomsControllerGetRoomUsers", () => {
    const roomID: string = "roomID_example"
    return expect(instance.roomsControllerGetRoomUsers(roomID, {})).resolves.toBe(null)
  })
  test("roomsControllerJoinRoom", () => {
    const roomID: string = "roomID_example"
    return expect(instance.roomsControllerJoinRoom(roomID, {})).resolves.toBe(null)
  })
  test("roomsControllerLeaveRoom", () => {
    const roomID: string = "roomID_example"
    return expect(instance.roomsControllerLeaveRoom(roomID, {})).resolves.toBe(null)
  })
  test("roomsControllerUnbookmarkRoom", () => {
    const roomID: string = "roomID_example"
    return expect(instance.roomsControllerUnbookmarkRoom(roomID, {})).resolves.toBe(null)
  })
  test("roomsControllerUpdateRoom", () => {
    const body: api.UpdateRoomDto = undefined
    const roomID: string = "roomID_example"
    return expect(instance.roomsControllerUpdateRoom(body, roomID, {})).resolves.toBe(null)
  })
  test("roomsControllerUpdateRoomInfo", () => {
    const body: api.UpdateRoomDto = undefined
    const roomID: string = "roomID_example"
    return expect(instance.roomsControllerUpdateRoomInfo(body, roomID, {})).resolves.toBe(null)
  })
})

describe("UsersApi", () => {
  let instance: api.UsersApi
  beforeEach(function() {
    instance = new api.UsersApi(config)
  });

  test("usersControllerCreateRoom", () => {
    const body: api.CreateRoomDto = undefined
    const none: any = undefined
    return expect(instance.usersControllerCreateRoom(body, none, {})).resolves.toBe(null)
  })
  test("usersControllerCreateRoom_0", () => {
    const body: api.CreateRoomDto = undefined
    const none: any = undefined
    return expect(instance.usersControllerCreateRoom_0(body, none, {})).resolves.toBe(null)
  })
  test("usersControllerFollowUser", () => {
    const username: string = "username_example"
    return expect(instance.usersControllerFollowUser(username, {})).resolves.toBe(null)
  })
  test("usersControllerFollowUser_0", () => {
    const username: string = "username_example"
    return expect(instance.usersControllerFollowUser_0(username, {})).resolves.toBe(null)
  })
  test("usersControllerGetBookmarks", () => {
    const none: any = undefined
    return expect(instance.usersControllerGetBookmarks(none, {})).resolves.toBe(null)
  })
  test("usersControllerGetBookmarks_0", () => {
    const none: any = undefined
    return expect(instance.usersControllerGetBookmarks_0(none, {})).resolves.toBe(null)
  })
  test("usersControllerGetFollowers", () => {
    const none: any = undefined
    return expect(instance.usersControllerGetFollowers(none, {})).resolves.toBe(null)
  })
  test("usersControllerGetFollowers_0", () => {
    const none: any = undefined
    return expect(instance.usersControllerGetFollowers_0(none, {})).resolves.toBe(null)
  })
  test("usersControllerGetFollowing", () => {
    const none: any = undefined
    return expect(instance.usersControllerGetFollowing(none, {})).resolves.toBe(null)
  })
  test("usersControllerGetFollowing_0", () => {
    const none: any = undefined
    return expect(instance.usersControllerGetFollowing_0(none, {})).resolves.toBe(null)
  })
  test("usersControllerGetProfileByUsername", () => {
    const username: string = "username_example"
    return expect(instance.usersControllerGetProfileByUsername(username, {})).resolves.toBe(null)
  })
  test("usersControllerGetProfileByUsername_0", () => {
    const username: string = "username_example"
    return expect(instance.usersControllerGetProfileByUsername_0(username, {})).resolves.toBe(null)
  })
  test("usersControllerGetRecentRooms", () => {
    const none: any = undefined
    return expect(instance.usersControllerGetRecentRooms(none, {})).resolves.toBe(null)
  })
  test("usersControllerGetRecentRooms_0", () => {
    const none: any = undefined
    return expect(instance.usersControllerGetRecentRooms_0(none, {})).resolves.toBe(null)
  })
  test("usersControllerGetRecommendedRooms", () => {
    const none: any = undefined
    return expect(instance.usersControllerGetRecommendedRooms(none, {})).resolves.toBe(null)
  })
  test("usersControllerGetRecommendedRooms_0", () => {
    const none: any = undefined
    return expect(instance.usersControllerGetRecommendedRooms_0(none, {})).resolves.toBe(null)
  })
  test("usersControllerGetUserFriends", () => {
    const none: any = undefined
    return expect(instance.usersControllerGetUserFriends(none, {})).resolves.toBe(null)
  })
  test("usersControllerGetUserFriends_0", () => {
    const none: any = undefined
    return expect(instance.usersControllerGetUserFriends_0(none, {})).resolves.toBe(null)
  })
  test("usersControllerGetUserInfo", () => {
    return expect(instance.usersControllerGetUserInfo({})).resolves.toBe(null)
  })
  test("usersControllerGetUserInfo_0", () => {
    return expect(instance.usersControllerGetUserInfo_0({})).resolves.toBe(null)
  })
  test("usersControllerGetUserRooms", () => {
    const none: any = undefined
    return expect(instance.usersControllerGetUserRooms(none, {})).resolves.toBe(null)
  })
  test("usersControllerGetUserRooms_0", () => {
    const none: any = undefined
    return expect(instance.usersControllerGetUserRooms_0(none, {})).resolves.toBe(null)
  })
  test("usersControllerPatchProfile", () => {
    const body: api.UpdateUserDto = undefined
    return expect(instance.usersControllerPatchProfile(body, {})).resolves.toBe(null)
  })
  test("usersControllerPatchProfile_0", () => {
    const body: api.UpdateUserDto = undefined
    return expect(instance.usersControllerPatchProfile_0(body, {})).resolves.toBe(null)
  })
  test("usersControllerPutProfile", () => {
    const body: api.UpdateUserDto = undefined
    return expect(instance.usersControllerPutProfile(body, {})).resolves.toBe(null)
  })
  test("usersControllerPutProfile_0", () => {
    const body: api.UpdateUserDto = undefined
    return expect(instance.usersControllerPutProfile_0(body, {})).resolves.toBe(null)
  })
  test("usersControllerUnfollowUser", () => {
    const username: string = "username_example"
    return expect(instance.usersControllerUnfollowUser(username, {})).resolves.toBe(null)
  })
  test("usersControllerUnfollowUser_0", () => {
    const username: string = "username_example"
    return expect(instance.usersControllerUnfollowUser_0(username, {})).resolves.toBe(null)
  })
})

