document.addEventListener('DOMContentLoaded', function() {
            // Inisialisasi HLS.js
            let hls = new Hls();
            const video = document.getElementById('hls-player');
            
            // Channel selection functionality
            const channelBtns = document.querySelectorAll('.channel-btn');
            const tvFrame = document.getElementById('tv-frame');
            const hlsContainer = document.getElementById('hls-container');
            const playerPlaceholder = document.getElementById('player-placeholder');
            const currentChannel = document.getElementById('current-channel');
            const currentGroup = document.getElementById('current-group');
            
            // Fungsi untuk memutar stream HLS
            function playHlsStream(url) {
                // Tampilkan placeholder
                tvFrame.style.display = 'none';
                hlsContainer.style.display = 'none';
                playerPlaceholder.style.display = 'block';
                
                // Hentikan stream sebelumnya jika ada
                if (hls) {
                    hls.destroy();
                }
                
                // Buat instance HLS baru
                hls = new Hls();
                
                // Attach ke video element
                hls.loadSource(url);
                hls.attachMedia(video);
                
                // Tunggu until media bisa diputar
                hls.on(Hls.Events.MANIFEST_PARSED, function() {
                    playerPlaceholder.style.display = 'none';
                    hlsContainer.style.display = 'block';
                    video.play().catch(e => {
                        console.error("Error attempting to play:", e);
                    });
                });
                
                // Handle errors
                hls.on(Hls.Events.ERROR, function(event, data) {
                    console.error("HLS error:", data);
                    if (data.fatal) {
                        switch(data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                alert('Gagal memuat stream. Silakan coba channel lain atau periksa koneksi internet Anda.');
                                hls.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                alert('Error media. Silakan coba channel lain.');
                                hls.recoverMediaError();
                                break;
                            default:
                                alert('Error tidak diketahui. Silakan coba channel lain.');
                                break;
                        }
                    }
                });
            }
            
            // Fungsi untuk memutar iframe biasa
            function playIframeStream(url) {
                // Sembunyikan player HLS dan tampilkan iframe
                hlsContainer.style.display = 'none';
                playerPlaceholder.style.display = 'none';
                tvFrame.style.display = 'block';
                
                // Hentikan HLS stream jika sedang berjalan
                if (hls) {
                    hls.stopLoad();
                    video.pause();
                }
                
                // Set iframe source
                tvFrame.src = url;
            }
            
            channelBtns.forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Remove active class from all buttons
                    channelBtns.forEach(b => b.classList.remove('active'));
                    
                    // Add active class to clicked button
                    this.classList.add('active');
                    
                    // Get stream details
                    const streamSrc = this.getAttribute('data-src');
                    const streamType = this.getAttribute('data-type');
                    const channelName = this.getAttribute('data-name');
                    const channelGroup = this.getAttribute('data-group');
                    
                    // Update channel info
                    currentChannel.textContent = channelName;
                    currentGroup.textContent = channelGroup;
                    
                    // Play stream based on type
                    if (streamType === 'hls') {
                        playHlsStream(streamSrc);
                    } else {
                        playIframeStream(streamSrc);
                    }
                });
            });
            
            // Handle potential iframe errors
            tvFrame.addEventListener('error', function() {
                alert('Gagal memuat streaming. Silakan coba channel lain atau periksa koneksi internet Anda.');
            });
            
            // Cek jika browser native support HLS
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                // Untuk browser yang support native HLS (Safari)
                video.addEventListener('loadedmetadata', function() {
                    video.play();
                });
            }
        });