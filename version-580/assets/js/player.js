import { H as Hls } from './hls-module.js';

const initPlayer = () => {
    const player = document.querySelector('[data-player]');
    if (!player) {
        return;
    }

    const video = player.querySelector('video');
    const toggle = player.querySelector('[data-player-toggle]');
    const message = player.querySelector('[data-player-message]');
    const source = video ? video.dataset.src : '';

    if (!video || !source) {
        if (message) {
            message.textContent = '未找到播放源。';
        }
        return;
    }

    const setMessage = (text) => {
        if (message) {
            message.textContent = text || '';
        }
    };

    if (Hls && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => setMessage(''));
        hls.on(Hls.Events.ERROR, (event, data) => {
            if (!data || !data.fatal) {
                return;
            }
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                setMessage('网络错误，正在重新加载播放源。');
                hls.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                setMessage('媒体错误，正在尝试恢复播放。');
                hls.recoverMediaError();
            } else {
                setMessage('当前播放源暂时无法播放。');
                hls.destroy();
            }
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
    } else {
        setMessage('当前浏览器不支持 HLS 播放。');
    }

    const playVideo = async () => {
        try {
            await video.play();
            player.classList.add('is-playing');
        } catch (error) {
            setMessage('点击视频控件后即可开始播放。');
        }
    };

    toggle?.addEventListener('click', playVideo);
    video.addEventListener('play', () => player.classList.add('is-playing'));
    video.addEventListener('pause', () => player.classList.remove('is-playing'));
};

document.addEventListener('DOMContentLoaded', initPlayer);
