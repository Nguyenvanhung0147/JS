const $= document.querySelector.bind(document);
const $$=document.querySelectorAll.bind(document);

const playlist =$('.playlist');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio'); 
const cd = $('.cd');
const playBtn =$(' .btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prewBtn = $('.btn-prew');
const ramdomBtn= $('.btn-ramdom');
const repeatBtn=$('.btn-repeat');
const PLAYER_STORAGE_KEY ="CHRONOS";
const app={
    currentIndex: 0,
    isPlaying:false,
    isRamdom:false,
    isRepeat:false,
    config:JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY))||{},
    setConfig: function(key,value){ 
        this.config[key]=value;
        localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify(this.config));
    },
    songs: [
        {
            name:'Ái Nộ',
            singer:'Masew',
            path:'./Assets/Musics/AiNo.mp3',
            image:'./Assets/Images/AiNo.jpg'
        },
        {
            name:'Cưới Thôi',
            singer:'Masew',
            path:'./Assets/Musics/CuoiThoi.mp3',
            image:'./Assets/Images/CuoiThoi.jpg'
        },
        {
            name:'Rather Be',
            singer:'Clean Bandit',
            path:'./Assets/Musics/RatherBe.mp3',
            image:'./Assets/Images/RatherBe.jpg'
        },
        {
            name:'Thức Giấc',
            singer:'DA LAB',
            path:'./Assets/Musics/ThucGiac.mp3',
            image:'./Assets/Images/ThucGiac.jpg'
        },
        {
            name:'Muộn Rồi Mà Sao Còn',
            singer:'Clean Bandit',
            path:'./Assets/Musics/MuonRoiMaSaoCon.mp3',
            image:'./Assets/Images/Muon_roi_ma_sao_con.jpg'
        },
        {
            name:'Có Hẹn Với Thanh Xuân',
            singer:'Monstar',
            path:'./Assets/Musics/CoHenVoiThanhXuan.mp3',
            image:'./Assets/Images/CoHenVoiThanhXuan.jpg'
        },
        {
            name:'Nước Mắt Em Lau Bằng Tình Yêu Mới',
            singer:'Clean Bandit',
            path:'./Assets/Musics/NuocMatEmLauBangTinhYeuMoi.mp3',
            image:'./Assets/Images/NuocMatEmLauBangTinhYeuMoi.jpg'
        }
    ],
    
    render: function(){
        const htmls = this.songs.map((song,index)=>{
            return `
            <div class="song ${index===this.currentIndex ? 'active':''}" data-index ="${index}">
            <div class="thumb" style="background-image: url('${song.image}')" >
            </div>
            <div class="body">
              <h3 class="title">${song.name}</h3>
              <p class="author">${song.singer}</p>
            </div>
            <div class="option">
              <i class="fas fa-ellipsis-h"></i>
            </div>
          </div>
            `
        })
        playlist.innerHTML = htmls.join('\n');
    },

    defineProperties: function(){
        Object.defineProperty(this, 'currentSong',{
            get: function(){
                return this.songs[this.currentIndex]
            } 
        })
    },

    handleEvent: function(){
        const _this = this;
        const cdWidth = cd.offsetWidth;
        //xu ly cd quay 
        const cdThumbAnimate= cdThumb.animate([
            {
                transform: 'rotate(360deg)'
            }
        ],{
            duration:10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause()
        //xu ly phong to thu nho
        document.onscroll = function(){
            const scrollTop= window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth -scrollTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }
        //xu ly play
        playBtn.onclick = function(){
            if(_this.isPlaying){         
                audio.pause();
            }else{
                audio.play();
            }

        }
        //play song
        audio.onplay=function(){
            _this.isPlaying=true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }
        //pause song
        audio.onpause=function(){
            _this.isPlaying=false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }
        //time update song
        audio.ontimeupdate = function(){
            if(audio.duration){
                const progressPercent = Math.floor(audio.currentTime/audio.duration *100)
                progress.value = progressPercent
            }
        }
        //xu ly khi tua
        progress.onchange = function(e){
            const seekTime = audio.duration/100 * e.target.value;
            audio.currentTime = seekTime;
        }
        //next song
        nextBtn.onclick = function(){
            if(_this.isRamdom){
                _this.playRamdomSong()
            }else{
                _this.nextSong()
            }
            audio.play()
            _this.render();
            _this.scrollToActiveSong()
        }
         //prev song
        prewBtn.onclick = function(){
            if(_this.isRamdom){
                _this.playRamdomSong()
            }else{
                _this.prevSong()
            }
            audio.play()
            _this.render();
            _this.scrollToActiveSong()
        }
        //ramdom song
        ramdomBtn.onclick = function(e){
            _this.isRamdom=!_this.isRamdom;
            _this.setConfig('isRamdom',_this.isRamdom)
            ramdomBtn.classList.toggle('active',_this.isRamdom);
        
        }         
        //repeat song
        repeatBtn.onclick = function(e){
            _this.isRepeat=!_this.isRepeat;
            repeatBtn.classList.toggle('active',_this.isRepeat);
        }
        //next song when audio ended 
        audio.onended = function(){
            if(_this.isRepeat){
                audio.play();
            }else{
                nextBtn.click()
            }
         
        }
        // click on playlist
        playlist.onclick =function (e){
            const NodeSong =e.target.closest('.song:not(.actice)');
            if(NodeSong || e.target.closest('.option')){ 
                if(NodeSong ){
                    _this.currentIndex = Number(NodeSong.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                   
                }

            }
        }
    },
    playRamdomSong: function(){
        let newIndex
        do{
            newIndex= Math.floor(Math.random()*this.songs.length)
        }while (newIndex===this.currentIndex)
        this.currentIndex= newIndex;
        this.loadCurrentSong();
    },
    scrollToActiveSong: function(){
        setTimeout(()=>{
            $('.song.active').scrollIntoView({
                behavior:'smooth',
                block: 'nearest',
            }) ;
        },500)
    },
    loadConfig: function(){
        this.isRamdom = this.config.isRamdom
        this.isRepeat = this.config.isRepeat
    },
    loadCurrentSong: function(){
        
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    nextSong : function(){
        this.currentIndex++
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0
        }
        this.loadCurrentSong();
    },
    prevSong : function(){
        this.currentIndex--
        if(this.currentIndex <0){
            this.currentIndex = this.songs.length;
        }
        this.loadCurrentSong();
    },
    start: function(){
        //cau hinh config
        this.loadConfig();
        //Định nghĩa thuọc tính
        this.defineProperties();
        //xử lý
        this.handleEvent();
        //tai thong tin bai hat dau tien khi chay  ung dung
        this.loadCurrentSong();
        //render playlist
        this.render();
        ramdomBtn.classList.toggle('active',_this.isRamdom);
        repeatBtn.classList.toggle('active',_this.isRepeat);
    }
}

app.start()
console.log(heading,cdThumb,audio)
