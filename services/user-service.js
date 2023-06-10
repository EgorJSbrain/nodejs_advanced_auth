const bcrypt = require('bcrypt')
const uuid = require('uuid')
const tokenService = require('./token-service')
const UserDto = require('../dtos/user-dto')
const UserModel = require('../models/user-model')
const mailService = require('../services/mail-service')
const ApiError = require('../exceptions/api-error')

class UserService {
  async registration(email, password) {
    const candidate = await UserModel.findOne({ email })

    if (candidate) {
      throw ApiError.BadRequest(`User with email ${email} existed`)
    }

    const hashPassword = await bcrypt.hash(password, 5)
    const activationLink = uuid.v4()

    const user = await UserModel.create({ email, password: hashPassword, activationLink })
    await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`)
    const userDto = new UserDto(user)
    const tokens = tokenService.generateTokens({ ...userDto })
    await tokenService.saveToken(userDto.id, tokens.refreshToken)

    return { ...tokens, user: userDto }
  }

  async activate(activationLink) {
    const user = await UserModel.findOne({ activationLink })

    if (!user) {
      throw ApiError.BadRequest(`Link is not correct`)
    }

    user.isActivated = true
    await user.save()
  }

  async login(email, password) {
    const user = await UserModel.findOne({ email })

    if (!user) {
      throw ApiError.BadRequest(`User with email ${email} doesn't found`)
    }

    const isPassEquals = await bcrypt.compare(password, user.password)

    if (!isPassEquals) {
      throw ApiError.BadRequest('Password is not correct')
    }

    const userDto = new UserDto(user)
    const tokens = tokenService.generateTokens({ ...userDto })

    await tokenService.saveToken(userDto.id, tokens.refreshToken)

    return { ...tokens, user: userDto }
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken)

    return token
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError()
    }

    const userData = tokenService.validateRefreshToken(refreshToken)
    const tokenFromDb = tokenService.findToken(refreshToken)

    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError()
    }

    const user = UserModel.findById(userData.id)
    const userDto = new UserDto(user)
    const tokens = tokenService.generateTokens({ ...userDto })

    await tokenService.saveToken(userDto.id, tokens.refreshToken)

    return { ...tokens, user: userDto }
  }

  async getUsers() {
    const users = await UserModel.find()

    return users
  }
}

module.exports = new UserService()
