/* eslint-disable */
import { login, logout } from './login'
import { displayMap } from './map'
import { updateSettings } from './updateSetting'

// VALUES
const mapBox = document.getElementById('map')
const loginForm = document.querySelector('.form--login')
const logoutBtn = document.querySelector('.nav__el--logout')
const updateUserData = document.querySelector('.form-user-data')
const updateUserPassword = document.querySelector('.form-user-password')


if (mapBox) {
  let locations = JSON.parse(document.getElementById('map').dataset.locations)
  displayMap(locations)
}

if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    login(email, password)
  })
}
if (logoutBtn) {
  logoutBtn.addEventListener('click', logout)
}

if (updateUserData) {
  updateUserData.addEventListener('submit', (event) => {
    event.preventDefault()
    const name = document.getElementById('name').value
    const email = document.getElementById('email').value
    updateSettings({ name, email }, 'userData')
  })
}

if (updateUserPassword) {
  updateUserPassword.addEventListener('submit', async (event) => {
    event.preventDefault()

    const saveBtn = document.querySelector('.btn--save-password')

    saveBtn.innerHTML = 'UPDATING..'
    const password = document.getElementById('password-current').value
    const newPassword = document.getElementById('password').value
    const newPasswordConfirm = document.getElementById('password-confirm').value
    await updateSettings(
      { password, newPassword, newPasswordConfirm },
      'password'
    )

    document.getElementById('password-current').value = ''
    document.getElementById('password').value = ''
    document.getElementById('password-confirm').value = ''

    saveBtn.innerHTML = 'SAVE PASSWORD'
  })
}
