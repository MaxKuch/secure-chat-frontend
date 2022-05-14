import hash from 'object-hash'
import aesjs from 'aes-js'

function makeKey(key) {
    return hash(key).split('').map(c => +String(c.charCodeAt()).split('').pop()).slice(0, 16)
}

function saveSecretKey(key, dialogId) {

    const localStorage = window.localStorage
    const dialogs = JSON.parse(localStorage.getItem('dialogs') || '{}')
    dialogs[dialogId] = makeKey(key)
    localStorage.setItem('dialogs', JSON.stringify(dialogs))
}

function getSecretKey(dialogId) {
    const localStorage = window.localStorage
    const dialogs = JSON.parse(localStorage.getItem('dialogs') || '{}')
    if(Object.keys(dialogs) === 0) return null
    return dialogs[dialogId] || null
}

function encryptMessage(message, dialogId) {
    
    const textBytes = aesjs.utils.utf8.toBytes(message)
    const key = getSecretKey(dialogId)
    if(!key) return null

    const aesCtr = new aesjs.ModeOfOperation.ctr(key)
    const encryptedBytes = aesCtr.encrypt(textBytes)
    
    const encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes)
    
    return encryptedHex
}

function decryptHex(hex, key) {
    const encryptedBytes = aesjs.utils.hex.toBytes(hex)
    const aesCtr = new aesjs.ModeOfOperation.ctr(key)
    const decryptedBytes = aesCtr.decrypt(encryptedBytes)
    
    return aesjs.utils.utf8.fromBytes(decryptedBytes)
}

function decryptMessages(encryptedMessages, dialogId) {
    
    const key = getSecretKey(dialogId)
    if(!key) return []

    return encryptedMessages.map(encMsg => ({...encMsg, text: decryptHex(encMsg.text, key) }))
    
}

function decryptMessage(encryptedMessage, dialogId) {
    
    const key = getSecretKey(dialogId)
    if(!key) return null

    return {...encryptedMessage, text: decryptHex(encryptedMessage.text, key) }
    
}

const MesagesEncryption = { saveSecretKey, encryptMessage, getSecretKey, decryptMessages, decryptMessage }

export default MesagesEncryption