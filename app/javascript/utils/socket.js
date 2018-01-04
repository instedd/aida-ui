import { Socket } from 'phoenix'

const socket = new Socket(window.previewSocketUrl)
socket.connect()

export default socket
