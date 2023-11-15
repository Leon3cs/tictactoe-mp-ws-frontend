import { useEffect } from 'react'
import QRCode from "qrcode";
import game from '../styles/TicTacToe.module.css'

export default function WaitScreen({ url, copyUrl, copyButtonText }){

    useEffect(() => {
        const generateQRCode = async () => {
            const canvasEl = document.getElementById('qr')

            if(url){
                await QRCode.toCanvas(canvasEl, url)
            }
        }
        generateQRCode()
    }, [url])

    return <div>
        <p className={game.score}>WAITING FOR OTHER PLAYER</p>
        <p className={game.message}>
            Let someone join by scanning this QR code
        </p>
        <div className={game.matchLink}>
            <canvas id="qr"></canvas>
        </div>
        <p className={game.message}>Or copy the match link below</p>
        <div className={game.matchLink}>
            <button onClick={copyUrl}>{copyButtonText}</button>
        </div>
    </div>
}