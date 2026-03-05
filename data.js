

const songs = [
    //Arijit Singh
    { id: 1, title: 'Shayad (From "Love Aaj Kal")', artist: "Pritam & Arijit Singh", album: "Arijit singh Essentials", duration: "4:08", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P1.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819760/Shayad_k01nr7.mp3", video: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Video/V2.mp4", language: "Hindi", genre: "EDM" },
    { id: 2, title: "Apna Bana Le (From 'Bhediya')", artist: "Sachin-Jigar, Arijit Singh & Amitabh Bhattacharya", album: "Arijit singh Essentials", duration: "4:21", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P2.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819859/Apna_Bana_Le_mr1eq7.mp3", video: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Video/V4.mp4", language: "Hindi", genre: "EDM" },
    { id: 3, title: "Kesariya (From 'Brahmastra')", artist: "Pritam, Arijit Singh & Amitabh Bhattacharya", album: "Arijit singh Essentials", duration: "4:28", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P5.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819839/Kesariya_i83agd.mp3", video: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Video/V3.mp4", language: "Hindi", genre: "EDM" },
    { id: 4, title: "Ishq Mubarak (From 'Tum Bin 2')", artist: "Arijit Singh", album: "Arijit singh Essentials", duration: "4:56", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P6.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819840/Ishq_Mubarak_comnib.mp3", video: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Video/V5.mp4", language: "Hindi", genre: "EDM" },
    { id: 5, title: "Aabaad Barbaad (From 'Ludo')", artist: "Pritam & Arijit Singh", album: "Arijit singh Essentials", duration: "5:09", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P8.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819871/Aabaad_Barbaad_zrryg3.mp3", video: "https://media.istockphoto.com/id/1283681475/video/neon-light-tunnel.mp4?s=mp4-640x640-is&k=20&c=2-rG68eJ2eJ2gG2y2v2_2g2h2j2k2l2m2n2o2p2q2r2s=", language: "Hindi", genre: "EDM" },
    { id: 6, title: "Khairiyat (From 'Chhichhore')", artist: "Arijit Singh", album: "Arijit singh Essentials", duration: "4:40", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P9.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819822/Khairiyat_Sad_guiqnf.mp3", video: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Video/V6.mp4", language: "Hindi", genre: "EDM" },
    { id: 7, title: "Uska Hi Banana (From '1920: Evil Returns')", artist: "Arijit Singh", album: "Arijit singh Essentials", duration: "5:27", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P10.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819802/Uska_Hi_Banana_bednsr.mp3", video: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Video/V8.mp4", language: "Hindi", genre: "EDM" },
    { id: 8, title: "Sanam Re", artist: "Mithoon, Arijit Singh", album: "Arijit singh Essentials", duration: "5:08", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P11.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819804/Sanam_Re_jodfmr.mp3", video: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Video/V7.mp4", language: "Hindi", genre: "EDM" },
    { id: 9, title: "First Class", artist: "Pritam, Arijit Singh & Neeti Mohan", album: "Arijit singh Essentials", duration: "5:02", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P7..jpg", src: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Arijit/First%20Class.mp3", video: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Video/V1.mp4", language: "Hindi", genre: "EDM" },
    { id: 10, title: "Hawayein", artist: "Arijit Singh", album: "Arijit singh Essentials", duration: "4:50", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P12.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819856/Hawayein_s3qzwm.mp3", video: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Video/V9.mp4", language: "Hindi", genre: "EDM" },
    { id: 11, title: "Sajni", artist: "Arijit Singh, Ram Sampath & Prashant Pandey", album: "Arijit singh Essentials", duration: "2:50", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P14.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819805/Sajni_zwnd1t.mp3", video: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Video/V12.mp4", language: "Hindi", genre: "EDM" },
    { id: 12, title: "Tera Yaar Hoon Main", artist: "Arijit Singh", album: "Arijit singh Essentials", duration: "4:38", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P15.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819778/Tera_Yaar_Hoon_Main_ogykvy.mp3", video: "https://media.istockphoto.com/id/1183323067/video/retro-sci-fi-background-futuristic-grid-landscape-of-the-80s-digital-cyber-surface.mp4?s=mp4-640x640-is&k=20&c=2-rG68eJ2eJ2gG2y2v2_2g2h2j2k2l2m2n2o2p2q2r2s=", language: "Hindi", genre: "EDM" },
    { id: 13, title: "Pal", artist: "Javed Mohsin, Arijit Singh & Shreya Ghoshal", album: "Arijit singh Essentials", duration: "4:07", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P3.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819787/Pal_tcetzr.mp3", video: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Video/V14.mp4", language: "Hindi", genre: "EDM" },
    { id: 14, title: "Khairiyat (Bonus track)", artist: "Arijit Singh", album: "Arijit singh Essentials", duration: "4:30", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P9.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819814/Khairiyat_Happy_wzpd8b.mp3", video: "https://media.istockphoto.com/id/1183323067/video/retro-sci-fi-background-futuristic-grid-landscape-of-the-80s-digital-cyber-surface.mp4?s=mp4-640x640-is&k=20&c=2-rG68eJ2eJ2gG2y2v2_2g2h2j2k2l2m2n2o2p2q2r2s=", language: "Hindi", genre: "EDM" },
    { id: 15, title: "Phir Aur Kya Chahiye", artist: "Sachin-jigar, Arijit Singh & Amitabh Bhattacharya", album: "Arijit singh Essentials", duration: "4:26", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P16.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819792/Phir_Aur_Kya_Chahiye_ocgfiu.mp3", video: "https://media.istockphoto.com/id/1183323067/video/retro-sci-fi-background-futuristic-grid-landscape-of-the-80s-digital-cyber-surface.mp4?s=mp4-640x640-is&k=20&c=2-rG68eJ2eJ2gG2y2v2_2g2h2j2k2l2m2n2o2p2q2r2s=", language: "Hindi", genre: "EDM" },
    { id: 16, title: 'Sitaare (From "Ikkis")', artist: "Arijit Singh", album: "Arijit Singh Essentials", duration: "4:02", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P18.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819772/Sitaare_mmdl3p.mp3", video: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Video/V16.mp4", language: "Hindi", genre: "EDM" },
    { id: 17, title: "Tujhe Kitna Chahne Lage", artist: "Arijit Singh", album: "Arijit singh Essentials", duration: "4:44", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P17.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819792/Tujhe_Kitna_Chahne_Lage_jltv5d.mp3", video: "https://media.istockphoto.com/id/1183323067/video/retro-sci-fi-background-futuristic-grid-landscape-of-the-80s-digital-cyber-surface.mp4?s=mp4-640x640-is&k=20&c=2-rG68eJ2eJ2gG2y2v2_2g2h2j2k2l2m2n2o2p2q2r2s=", language: "Hindi", genre: "EDM" },
    { id: 18, title: "Roke Na Ruke Naina", artist: "Arijit Singh", album: "Arijit singh Essentials", duration: "4:37", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P13.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819797/Roke_Na_Ruke_Naina_pdhwkk.mp3", video: "https://media.istockphoto.com/id/1183323067/video/retro-sci-fi-background-futuristic-grid-landscape-of-the-80s-digital-cyber-surface.mp4?s=mp4-640x640-is&k=20&c=2-rG68eJ2eJ2gG2y2v2_2g2h2j2k2l2m2n2o2p2q2r2s=", language: "Hindi", genre: "EDM" },
    { id: 19, title: "Tum Kya Mile", artist: "Pritam, Arijit Singh, Shreya Ghoshal & Amitabh Bhattacharya", album: "Arijit singh Essentials", duration: "4:38", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P4.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819755/Tum_Kya_Mile_uqyhio.mp3", video: "https://media.istockphoto.com/id/1183323067/video/retro-sci-fi-background-futuristic-grid-landscape-of-the-80s-digital-cyber-surface.mp4?s=mp4-640x640-is&k=20&c=2-rG68eJ2eJ2gG2y2v2_2g2h2j2k2l2m2n2o2p2q2r2s=", language: "Hindi", genre: "EDM" },
    { id: 20, title: "Ae Dil Hai Mushkil", artist: "Arijit Singh", album: "Arijit singh Essentials", duration: "4:29", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P26.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819874/Ae_Dil_Hai_Mushkil_Title_Track_oqsmkl.mp3", video: "https://media.istockphoto.com/id/1183323067/video/retro-sci-fi-background-futuristic-grid-landscape-of-the-80s-digital-cyber-surface.mp4?s=mp4-640x640-is&k=20&c=2-rG68eJ2eJ2gG2y2v2_2g2h2j2k2l2m2n2o2p2q2r2s=", language: "Hindi", genre: "EDM" },
    { id: 21, title: "Channa Mereya", artist: "Arijit Singh", album: "Arijit singh Essentials", duration: "4:49", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P25.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819866/Channa_Mereya_x58djx.mp3", video: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Video/V13.mp4", language: "Hindi", genre: "EDM" },
    { id: 22, title: "Ik Vaari Aa", artist: "Arijit Singh", album: "Arijit singh Essentials", duration: "4:34", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P29.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819844/Ik_Vaari_Aa_kl50d0.mp3", video: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Video/V10.mp4", language: "Hindi", genre: "EDM" },
    { id: 23, title: "Jaana Ve", artist: "Arijit Singh", album: "Arijit singh Essentials", duration: "5:33", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P22.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819832/Jaana_Ve_c0071e.mp3", video: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Video/V15.mp4", language: "Hindi", genre: "EDM" },
    { id: 24, title: "Kabira", artist: "Arijit Singh", album: "Arijit singh Essentials", duration: "3:43", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P30.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819833/Kabira_nyzopa.mp3", video: "https://media.istockphoto.com/id/1183323067/video/retro-sci-fi-background-futuristic-grid-landscape-of-the-80s-digital-cyber-surface.mp4?s=mp4-640x640-is&k=20&c=2-rG68eJ2eJ2gG2y2v2_2g2h2j2k2l2m2n2o2p2q2r2s=", language: "Hindi", genre: "EDM" },
    { id: 25, title: "Main Rang Sharbaton Ka", artist: "Arijit Singh", album: "Arijit singh Essentials", duration: "4:37", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P24.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819821/Main_Rang_Sharbaton_Ka_Reprise_ndp5yy.mp3", video: "https://media.istockphoto.com/id/1183323067/video/retro-sci-fi-background-futuristic-grid-landscape-of-the-80s-digital-cyber-surface.mp4?s=mp4-640x640-is&k=20&c=2-rG68eJ2eJ2gG2y2v2_2g2h2j2k2l2m2n2o2p2q2r2s=", language: "Hindi", genre: "EDM" },
    { id: 26, title: "Sooraj Dooba Hain", artist: "Arijit Singh", album: "Arijit singh Essentials", duration: "4:24", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P27.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819803/Sooraj_Dooba_Hain_nz7mws.mp3", video: "https://media.istockphoto.com/id/1183323067/video/retro-sci-fi-background-futuristic-grid-landscape-of-the-80s-digital-cyber-surface.mp4?s=mp4-640x640-is&k=20&c=2-rG68eJ2eJ2gG2y2v2_2g2h2j2k2l2m2n2o2p2q2r2s=", language: "Hindi", genre: "EDM" },
    { id: 27, title: "Tum Hi Ho", artist: "Arijit Singh", album: "Arijit singh Essentials", duration: "4:22", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P32.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819802/Tum_Hi_Ho_o9tjvl.mp3", video: "https://media.istockphoto.com/id/1183323067/video/retro-sci-fi-background-futuristic-grid-landscape-of-the-80s-digital-cyber-surface.mp4?s=mp4-640x640-is&k=20&c=2-rG68eJ2eJ2gG2y2v2_2g2h2j2k2l2m2n2o2p2q2r2s=", language: "Hindi", genre: "EDM" },
    { id: 28, title: "Meri Aashiqui", artist: "Arijit Singh", album: "Arijit singh Essentials", duration: "4:26", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P33.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819812/Meri_Aashiqui_yrwn3r.mp3", video: "https://media.istockphoto.com/id/1183323067/video/retro-sci-fi-background-futuristic-grid-landscape-of-the-80s-digital-cyber-surface.mp4?s=mp4-640x640-is&k=20&c=2-rG68eJ2eJ2gG2y2v2_2g2h2j2k2l2m2n2o2p2q2r2s=", language: "Hindi", genre: "EDM" },
    { id: 29, title: "Chahun Main Ya Naa", artist: "Arijit Singh", album: "Arijit singh Essentials", duration: "5:04", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P33.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819871/Chahun_Main_Ya_Naa_brm8nb.mp3", video: "https://media.istockphoto.com/id/1183323067/video/retro-sci-fi-background-futuristic-grid-landscape-of-the-80s-digital-cyber-surface.mp4?s=mp4-640x640-is&k=20&c=2-rG68eJ2eJ2gG2y2v2_2g2h2j2k2l2m2n2o2p2q2r2s=", language: "Hindi", genre: "EDM" },
    { id: 30, title: "Aasan Nahin Yahan", artist: "Arijit Singh", album: "Arijit singh Essentials", duration: "3:34", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P33.jpg", src: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Arijit/Aasan%20Nahin%20Yahan.mp3", video: "https://media.istockphoto.com/id/1183323067/video/retro-sci-fi-background-futuristic-grid-landscape-of-the-80s-digital-cyber-surface.mp4?s=mp4-640x640-is&k=20&c=2-rG68eJ2eJ2gG2y2v2_2g2h2j2k2l2m2n2o2p2q2r2s=", language: "Hindi", genre: "EDM" },
    { id: 31, title: "Milne Hai Mujhse Aayi", artist: "Arijit Singh", album: "Arijit singh Essentials", duration: "4:55", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P33.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819820/Milne_Hai_Mujhse_Aayi_dtjpns.mp3", video: "https://media.istockphoto.com/id/1183323067/video/retro-sci-fi-background-futuristic-grid-landscape-of-the-80s-digital-cyber-surface.mp4?s=mp4-640x640-is&k=20&c=2-rG68eJ2eJ2gG2y2v2_2g2h2j2k2l2m2n2o2p2q2r2s=", language: "Hindi", genre: "EDM" },
    { id: 32, title: "Satranga", artist: "Arijit Singh", album: "Arijit singh Essentials", duration: "4:31", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P28.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819812/Satranga_q7d7ji.mp3", video: "https://media.istockphoto.com/id/1183323067/video/retro-sci-fi-background-futuristic-grid-landscape-of-the-80s-digital-cyber-surface.mp4?s=mp4-640x640-is&k=20&c=2-rG68eJ2eJ2gG2y2v2_2g2h2j2k2l2m2n2o2p2q2r2s=", language: "Hindi", genre: "EDM" },
    { id: 33, title: "Nashe Si Chadh Gayi", artist: "Arijit Singh", album: "Arijit singh Essentials", duration: "3:58", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P21.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819820/Nashe_Si_Chadh_Gayi_fpmaim.mp3", video: "https://media.istockphoto.com/id/1183323067/video/retro-sci-fi-background-futuristic-grid-landscape-of-the-80s-digital-cyber-surface.mp4?s=mp4-640x640-is&k=20&c=2-rG68eJ2eJ2gG2y2v2_2g2h2j2k2l2m2n2o2p2q2r2s=", language: "Hindi", genre: "EDM" },
    { id: 34, title: "Gehra Hua", artist: "Arijit Singh", album: "Arijit singh Essentials", duration: "6:02", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P20.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819843/Gehra_Hua_vilqv9.mp3", video: "https://media.istockphoto.com/id/1183323067/video/retro-sci-fi-background-futuristic-grid-landscape-of-the-80s-digital-cyber-surface.mp4?s=mp4-640x640-is&k=20&c=2-rG68eJ2eJ2gG2y2v2_2g2h2j2k2l2m2n2o2p2q2r2s=", language: "Hindi", genre: "EDM" },
    { id: 35, title: "Gerua", artist: "Arijit Singh", album: "Arijit singh Essentials", duration: "5:45", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P19.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819858/Gerua_cggrq8.mp3", video: "https://media.istockphoto.com/id/1183323067/video/retro-sci-fi-background-futuristic-grid-landscape-of-the-80s-digital-cyber-surface.mp4?s=mp4-640x640-is&k=20&c=2-rG68eJ2eJ2gG2y2v2_2g2h2j2k2l2m2n2o2p2q2r2s=", language: "Hindi", genre: "EDM" },
    { id: 36, title: "Humdard", artist: "Arijit Singh", album: "Arijit singh Essentials", duration: "4:20", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P31.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819845/Humdard_xxphf2.mp3", video: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Video/V11.mp4", language: "Hindi", genre: "EDM" },
    { id: 37, title: "Tera Fitoor", artist: "Arijit Singh", album: "Arijit singh Essentials", duration: "5:10", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P23.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819766/Tera_Fitoor_psvbyw.mp3", video: "https://media.istockphoto.com/id/1183323067/video/retro-sci-fi-background-futuristic-grid-landscape-of-the-80s-digital-cyber-surface.mp4?s=mp4-640x640-is&k=20&c=2-rG68eJ2eJ2gG2y2v2_2g2h2j2k2l2m2n2o2p2q2r2s=", language: "Hindi", genre: "EDM" },
    { id: 38, title: "Aaj Zid", artist: "Arijit Singh", album: "Arijit singh Essentials", duration: "4:12", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P22.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819875/Aaj_Zid_vjeotg.mp3", video: "https://media.istockphoto.com/id/1183323067/video/retro-sci-fi-background-futuristic-grid-landscape-of-the-80s-digital-cyber-surface.mp4?s=mp4-640x640-is&k=20&c=2-rG68eJ2eJ2gG2y2v2_2g2h2j2k2l2m2n2o2p2q2r2s=", language: "Hindi", genre: "EDM" },
    { id: 39, title: "Dhun (Saiyaara)", artist: "Mithoon & Arijit Singh", album: "Arijit singh Essentials", duration: "4:36", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P35.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819858/Dhun_gbkiu4.mp3", video: "https://media.istockphoto.com/id/1183323067/video/retro-sci-fi-background-futuristic-grid-landscape-of-the-80s-digital-cyber-surface.mp4?s=mp4-640x640-is&k=20&c=2-rG68eJ2eJ2gG2y2v2_2g2h2j2k2l2m2n2o2p2q2r2s=", language: "Hindi", genre: "EDM" },
    { id: 40, title: "Darkhaast", artist: "Arijit Singh", album: "Arijit singh Essentials", duration: "6:14", cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/P34.jpg", src: "https://res.cloudinary.com/dgr4y56zb/video/upload/v1771819852/Darkhaast_y45k8c.mp3", video: "https://media.istockphoto.com/id/1183323067/video/retro-sci-fi-background-futuristic-grid-landscape-of-the-80s-digital-cyber-surface.mp4?s=mp4-640x640-is&k=20&c=2-rG68eJ2eJ2gG2y2v2_2g2h2j2k2l2m2n2o2p2q2r2s=", language: "Hindi", genre: "EDM" }

];


const albums = [
    {
        id: 1,
        title: "Arijit Singh Essentials",
        artist: "Arijit Singh",
        artistId: 1,
        cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/E1.jpg",
        year: 2024,
        songs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41]
    },
    {
        id: 2,
        title: "KK Essentials",
        artist: "KK",
        artistId: 6,
        cover: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/E2.png",
        year: 2077,
        songs: []
    },
    {
        id: 3,
        title: "Endless Summer",
        artist: "The Midnight",
        artistId: 3,
        cover: "https://images.unsplash.com/photo-1596700877943-7f2122650ba2?w=300&h=300&fit=crop",
        year: 2018,
        songs: [3, 10]
    },
    {
        id: 4,
        title: "Starboy",
        artist: "The Weeknd",
        artistId: 4,
        cover: "https://images.unsplash.com/photo-1619983081563-430f63602796?w=300&h=300&fit=crop",
        year: 2016,
        songs: [5]
    },
    {
        id: 5,
        title: "Random Access Memories",
        artist: "Daft Punk",
        artistId: 5,
        cover: "https://images.unsplash.com/photo-1594943026367-93ae345388c7?w=300&h=300&fit=crop",
        year: 2013,
        songs: [11]
    },
    {
        id: 6,
        title: "Retro Future",
        artist: "Synthwave Boy",
        artistId: 1,
        cover: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=300&fit=crop",
        year: 2024,
        songs: [1, 7]
    },
    {
        id: 7,
        title: "2077",
        artist: "Future Cop",
        artistId: 2,
        cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop",
        year: 2077,
        songs: [2, 6]
    },
    {
        id: 8,
        title: "Endless Summer",
        artist: "The Midnight",
        artistId: 3,
        cover: "https://images.unsplash.com/photo-1596700877943-7f2122650ba2?w=300&h=300&fit=crop",
        year: 2018,
        songs: [3, 10]
    },
    {
        id: 9,
        title: "Starboy",
        artist: "The Weeknd",
        artistId: 4,
        cover: "https://images.unsplash.com/photo-1619983081563-430f63602796?w=300&h=300&fit=crop",
        year: 2016,
        songs: [5]
    },
    {
        id: 10,
        title: "Random Access Memories",
        artist: "Daft Punk",
        artistId: 5,
        cover: "https://images.unsplash.com/photo-1594943026367-93ae345388c7?w=300&h=300&fit=crop",
        year: 2013,
        songs: [11]
    }
];

const artists = [
    {
        id: 1,
        name: "Arijit Singh",
        image: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/I1.jpg",
        aboutImage: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/I1.jpg",
        listeners: "5.6Cr",
        bio: "Synthwave Boy brings the 80s back to life with neon-soaked beats and retro-futuristic soundscapes. Join the ride through the digital frontier."
    },
    {
        id: 2,
        name: "Pritam",
        image: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A1.jpg",
        aboutImage: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A1.jpg",
        listeners: "987,654",
        bio: "Future Cop is the law in a lawless city. Delivering hard-hitting synth vibes and cinematic progressions."
    },
    {
        id: 3,
        name: "Vishal Mishra",
        image: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A21.jpg",
        aboutImage: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A21.jpg",
        listeners: "987,654",
        bio: "Future Cop is the law in a lawless city. Delivering hard-hitting synth vibes and cinematic progressions."
    },
    {
        id: 4,
        name: "Darshan Raval",
        image: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A16.jpg",
        aboutImage: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A16.jpg",
        listeners: "987,654",
        bio: "Future Cop is the law in a lawless city. Delivering hard-hitting synth vibes and cinematic progressions."
    },
    {
        id: 5,
        name: "Yo Yo Honey Singh",
        image: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A14.jpg",
        aboutImage: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A14.jpg",
        listeners: "987,654",
        bio: "Future Cop is the law in a lawless city. Delivering hard-hitting synth vibes and cinematic progressions."
    },
    {
        id: 6,
        name: "KK",
        image: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A20.jpg",
        aboutImage: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A20.jpg",
        listeners: "987,654",
        bio: "Future Cop is the law in a lawless city. Delivering hard-hitting synth vibes and cinematic progressions."
    },
    {
        id: 7,
        name: "Sachet Tandon",
        image: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A12.jpg",
        aboutImage: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A12.jpg",
        listeners: "987,654",
        bio: "Future Cop is the law in a lawless city. Delivering hard-hitting synth vibes and cinematic progressions."
    },
    {
        id: 8,
        name: "Parampara Tandon",
        image: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A13.jpg",
        aboutImage: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A13.jpg",
        listeners: "987,654",
        bio: "Future Cop is the law in a lawless city. Delivering hard-hitting synth vibes and cinematic progressions."
    },
    {
        id: 9,
        name: "Jubin Nautiyal",
        image: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A15.jpg",
        aboutImage: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A15.jpg",
        listeners: "987,654",
        bio: "Future Cop is the law in a lawless city. Delivering hard-hitting synth vibes and cinematic progressions."
    },
    {
        id: 10,
        name: "Himesh Reshammiya",
        image: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A19.jpg",
        aboutImage: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A19.jpg",
        listeners: "987,654",
        bio: "Future Cop is the law in a lawless city. Delivering hard-hitting synth vibes and cinematic progressions."
    },
    {
        id: 11,
        name: "Javed Ali",
        image: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A17.jpg",
        aboutImage: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A17.jpg",
        listeners: "987,654",
        bio: "Future Cop is the law in a lawless city. Delivering hard-hitting synth vibes and cinematic progressions."
    },
    {
        id: 12,
        name: "Mohammed Irfan",
        image: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A18.jpg",
        aboutImage: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A18.jpg",
        listeners: "987,654",
        bio: "Future Cop is the law in a lawless city. Delivering hard-hitting synth vibes and cinematic progressions."
    },
    {
        id: 13,
        name: "Sachet-Parampara",
        image: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A11.jpg",
        aboutImage: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A11.jpg",
        listeners: "987,654",
        bio: "Future Cop is the law in a lawless city. Delivering hard-hitting synth vibes and cinematic progressions."
    },
    {
        id: 14,
        name: "Atif Aslam",
        image: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A22.jpg",
        aboutImage: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A22.jpg",
        listeners: "987,654",
        bio: "Future Cop is the law in a lawless city. Delivering hard-hitting synth vibes and cinematic progressions."
    },
    {
        id: 15,
        name: "Rahat Fateh Ali Khan",
        image: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A23.jpg",
        aboutImage: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A23.jpg",
        listeners: "987,654",
        bio: "Future Cop is the law in a lawless city. Delivering hard-hitting synth vibes and cinematic progressions."
    },
    {
        id: 16,
        name: "Shreya Ghoshal",
        image: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A2.jpg",
        aboutImage: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A2.jpg",
        listeners: "2,450,100",
        bio: "The Midnight encompasses the feeling of youth, driving late at night, and the nostalgia of the unknown."
    },
    {
        id: 17,
        name: "Sachin Jigar",
        image: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A3.jpg",
        aboutImage: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A3.jpg",
        listeners: "75,000,000",
        bio: "The Weeknd has redefined modern R&B with his dark, atmospheric sound and falsetto voice."
    },
    {
        id: 18,
        name: "Neeti Mohan",
        image: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A6.jpg",
        aboutImage: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A6.jpg",
        listeners: "30,000,000",
        bio: "Legendary French duo who brought house music to the masses. Robots rocking the world."
    },
    {
        id: 19,
        name: "Mithoon",
        image: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A9.jpg",
        aboutImage: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A9.jpg",
        listeners: "5,600,000",
        bio: "The zombie driver of synthwave. Nightcall defined a generation of retro enthusiasts."
    },
    {
        id: 20,
        name: "Amitabh Bhattacharya",
        image: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A5.jpg",
        aboutImage: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A5.jpg",
        listeners: "1,100,000",
        bio: "Neon-noir cinematic universe in audio form. Gunship takes you on a journey through the 80s that never was."
    },
    {
        id: 21,
        name: "Sonu Nigam",
        image: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A10.webp",
        aboutImage: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A10.webp",
        listeners: "2,100,000",
        bio: "Darksynth master. Heavy beats, horror themes, and adrenaline-pumping energy."
    },
    {
        id: 22,
        name: "Javed Mohsin",
        image: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A8.jpg",
        aboutImage: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A8.jpg",
        listeners: "15,000,000",
        bio: "The High Priest of Pop. A musical genius who mastered funk, rock, R&B, and new wave."
    },
    {
        id: 23,
        name: "Prashant Pandey",
        image: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A7.jpg",
        aboutImage: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A7.jpg",
        listeners: "4,200,000",
        bio: "Electronic music producer known for 'Resonance' and pioneering the chillwave/synthwave sound."
    },
    {
        id: 24,
        name: "Ram Sampath",
        image: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A4.jpg",
        aboutImage: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A4.jpg",
        listeners: "3,800,000",
        bio: "Synthpop artist creating emotional, dark, and atmospheric electronic music."
    },
    {
        id: 24,
        name: "Sachin-Jigar",
        image: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A3.jpg",
        aboutImage: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Artists/A3.jpg",
        listeners: "3,800,000",
        bio: "Synthpop artist creating emotional, dark, and atmospheric electronic music."
    }
];

const playlists = [
    { id: 1, name: "My Favorites", songs: [1, 2, 3] },
    { id: 2, name: "Chill Vibes", songs: [4, 5] }
];

const deepDiveContent = [
    // Panel 1: Neon City (EDM/Synth)
    [
        { id: 101, title: "Neon City", artist: "Synthwave Boy", type: "Playlist", video: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Video/V2.mp4", audio: "On My Way.mp3", desc: "Drive through the neon-soaked streets of 2084.", songs: [1, 7, 2] },
        { id: 102, title: "Cyberpunk 2077", artist: "Future Cop", type: "Album", video: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Video/V4.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", desc: "The official soundtrack of the dark future.", songs: [2, 6, 8] },
        { id: 103, title: "Tech Noir", artist: "Gunship", type: "Album", video: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Video/V3.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", desc: "Cinematic synthwave for the modern age.", songs: [7, 1, 8] },
        { id: 104, title: "Dark Synth", artist: "Carpenter Brut", type: "Playlist", video: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Video/V5.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", desc: "Heavy beats and dark atmosphere.", songs: [8, 12, 6] },
        { id: 105, title: "Night Drive", artist: "Kavinsky", type: "Playlist", video: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Video/V6.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", desc: "Cruising at night with synthwave classics.", songs: [6, 12, 3] }
    ],
    // Panel 2: Retro Wave (Lo-fi/Chill)
    [
        { id: 201, title: "Retro Wave", artist: "The Midnight", type: "Playlist", video: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Video/V8.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", desc: "Relaxing synth beats for studying or coding.", songs: [3, 10, 9] },
        { id: 202, title: "Chillwave", artist: "Home", type: "Album", video: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Video/V7.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3", desc: "Nostalgic vibes and smooth textures.", songs: [9, 3, 10] },
        { id: 203, title: "Sunset", artist: "The Midnight", type: "Album", video: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Video/V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3", desc: "Golden hour vibes.", songs: [10, 3, 9] },
        { id: 204, title: "After Dark", artist: "Mr. Kitty", type: "Album", video: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Video/V3.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3", desc: "Late night emotional synthpop.", songs: [12, 6, 2] },
        { id: 205, title: "Memories", artist: "Daft Punk", type: "Album", video: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Video/V2.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3", desc: "A trip down memory lane.", songs: [11, 5, 2] }
    ],
    // Panel 3: Legends (Classic)
    [
        { id: 301, title: "Purple Haze", artist: "Prince", type: "Artist Mix", video: "https://raw.githubusercontent.com/Legend123-byte/Assests/main/Video/V6.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", desc: "Deep dive into the legendary Prince discography.", songs: [4, 5, 11] },
        { id: 302, title: "Starboy Era", artist: "The Weeknd", type: "Album", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", desc: "The Weeknd's chart-topping hits from 2016.", songs: [5, 11, 2] },
        { id: 303, title: "French Touch", artist: "Daft Punk", type: "Playlist", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3", desc: "The robots who changed electronic music forever.", songs: [11, 5, 2] },
        { id: 304, title: "After Hours", artist: "The Weeknd", type: "Playlist", video: "https://media.istockphoto.com/id/1283681475/video/neon-light-tunnel.mp4?s=mp4-640x640-is&k=20&c=2-rG68eJ2eJ2gG2y2v2_2g2h2j2k2l2m2n2o2p2q2r2s=", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", desc: "The late night saga continues.", songs: [5, 11] },
        { id: 305, title: "Robots", artist: "Daft Punk", type: "Album", video: "https://media.istockphoto.com/id/1295368945/video/abstract-loop-background-flight-through-neon-tunnel.mp4?s=mp4-640x640-is&k=20&c=2-rG68eJ2eJ2gG2y2v2_2g2h2j2k2l2m2n2o2p2q2r2s=", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3", desc: "Harder, Better, Faster, Stronger.", songs: [11, 5] }
    ],
    // Panel 4: Focus Flow
    [
        { id: 401, title: "Coding Mode", artist: "System", type: "Mix", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", desc: "Zero distraction beats.", songs: [1, 9, 7] },
        { id: 402, title: "Deep Work", artist: "Focus", type: "Playlist", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", desc: "Intense concentration.", songs: [2, 8, 6] },
        { id: 403, title: "Night Shift", artist: "Worker", type: "Mix", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", desc: "For the late night grinders.", songs: [3, 10, 12] },
        { id: 404, title: "Flow State", artist: "Mind", type: "Album", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3", desc: "Achieve peak performance.", songs: [9, 3, 1] },
        { id: 405, title: "Binary Beats", artist: "Dev", type: "Playlist", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3", desc: "Music for programmers.", songs: [10, 9, 2] }
    ],
    // Panel 5: Workout
    [
        { id: 501, title: "Pump Up", artist: "Gym", type: "Playlist", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", desc: "High energy tracks.", songs: [7, 8, 2] },
        { id: 502, title: "Cardio", artist: "Run", type: "Mix", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", desc: "Keep the pace.", songs: [8, 2, 7] },
        { id: 503, title: "Powerlifting", artist: "Lift", type: "Playlist", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", desc: "Heavy weights, heavy beats.", songs: [6, 12, 8] },
        { id: 504, title: "HIIT", artist: "Burn", type: "Mix", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3", desc: "Maximum intensity.", songs: [11, 5, 2] },
        { id: 505, title: "Cooldown", artist: "Stretch", type: "Playlist", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3", desc: "Relax after the burn.", songs: [9, 3, 10] }
    ],
    // Panel 6: Ambient
    [
        { id: 601, title: "Space Walk", artist: "Cosmos", type: "Album", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3", desc: "Zero gravity soundscapes.", songs: [9, 10, 3] },
        { id: 602, title: "Deep Ocean", artist: "Blue", type: "Playlist", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", desc: "Underwater vibes.", songs: [3, 9, 10] },
        { id: 603, title: "Rainy Day", artist: "Cloud", type: "Mix", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3", desc: "Cozy vibes for rainy days.", songs: [12, 6, 3] },
        { id: 604, title: "Forest", artist: "Nature", type: "Album", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3", desc: "Lost in the woods.", songs: [10, 3, 9] },
        { id: 605, title: "Dreamscape", artist: "Sleep", type: "Playlist", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3", desc: "Drifting into sleep.", songs: [9, 10, 12] }
    ],
    // Panel 7: Party
    [
        { id: 701, title: "House Party", artist: "DJ", type: "Mix", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3", desc: "Turn up the volume.", songs: [11, 5, 2] },
        { id: 702, title: "Club Classics", artist: "Dance", type: "Playlist", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", desc: "Hits from the dancefloor.", songs: [5, 11, 2] },
        { id: 703, title: "Rave", artist: "Glow", type: "Album", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", desc: "All night long.", songs: [2, 6, 8] },
        { id: 704, title: "Festival", artist: "Mainstage", type: "Mix", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", desc: "Big room sounds.", songs: [7, 1, 8] },
        { id: 705, title: "After Party", artist: "Sunrise", type: "Playlist", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", desc: "When the sun comes up.", songs: [6, 12, 3] }
    ],
    // Panel 8: Gaming
    [
        { id: 801, title: "FPS Focus", artist: "Sniper", type: "Playlist", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", desc: "Lock in.", songs: [7, 8, 1] },
        { id: 802, title: "RPG Adventure", artist: "Quest", type: "Album", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3", desc: "Epic journeys.", songs: [9, 3, 10] },
        { id: 803, title: "Racing", artist: "Speed", type: "Mix", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", desc: "High octane.", songs: [2, 6, 7] },
        { id: 804, title: "Boss Fight", artist: "Danger", type: "Playlist", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", desc: "Face the challenge.", songs: [8, 7, 2] },
        { id: 805, title: "Lobby", artist: "Chill", type: "Mix", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3", desc: "Waiting for match.", songs: [10, 9, 3] }
    ],
    // Panel 9: Romance
    [
        { id: 901, title: "Date Night", artist: "Love", type: "Playlist", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", desc: "Set the mood.", songs: [5, 4, 11] },
        { id: 902, title: "Heartbreak", artist: "Sad", type: "Album", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3", desc: "It's okay to cry.", songs: [12, 6, 3] },
        { id: 903, title: "Crush", artist: "Butterflies", type: "Mix", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", desc: "Thinking of you.", songs: [3, 9, 10] },
        { id: 904, title: "Soulmates", artist: "Forever", type: "Playlist", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3", desc: "Together always.", songs: [9, 10, 3] },
        { id: 905, title: "Slow Dance", artist: "Ballad", type: "Album", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", desc: "Hold me close.", songs: [6, 12, 4] }
    ],
    // Panel 10: Travel
    [
        { id: 1001, title: "Road Trip", artist: "Car", type: "Playlist", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", desc: "Highway tunes.", songs: [1, 7, 2] },
        { id: 1002, title: "Flight Mode", artist: "Plane", type: "Mix", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3", desc: "Above the clouds.", songs: [9, 10, 3] },
        { id: 1003, title: "Commute", artist: "Train", type: "Album", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", desc: "Daily grind.", songs: [3, 10, 9] },
        { id: 1004, title: "Beach", artist: "Sun", type: "Playlist", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", desc: "Sand and sea.", songs: [5, 11, 2] },
        { id: 1005, title: "City Walk", artist: "Urban", type: "Mix", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3", desc: "Urban exploration.", songs: [10, 9, 3] }
    ],
    // Panel 11: 80s
    [
        { id: 1101, title: "80s Pop", artist: "Retro", type: "Playlist", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", desc: "Greatest hits.", songs: [4, 5, 11] },
        { id: 1102, title: "Neon 80s", artist: "Glow", type: "Mix", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", desc: "Bright lights.", songs: [2, 6, 8] },
        { id: 1103, title: "Synth Pop", artist: "Keys", type: "Album", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3", desc: "Digital sounds.", songs: [11, 5, 2] },
        { id: 1104, title: "Rock Ballads", artist: "Hair", type: "Playlist", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", desc: "Power anthems.", songs: [7, 8, 4] },
        { id: 1105, title: "Movie Themes", artist: "Cinema", type: "Mix", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", desc: "Soundtrack of a decade.", songs: [6, 12, 8] }
    ],
    // Panel 12: New Arrivals
    [
        { id: 1201, title: "Fresh Finds", artist: "New", type: "Playlist", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", desc: "Discover next.", songs: [1, 7, 2] },
        { id: 1202, title: "Rising", artist: "Star", type: "Mix", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", desc: "Up and coming.", songs: [2, 6, 8] },
        { id: 1203, title: "Viral", artist: "Trend", type: "Album", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", desc: "Trending now.", songs: [5, 11, 2] },
        { id: 1204, title: "Underground", artist: "Deep", type: "Playlist", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", desc: "Hidden gems.", songs: [8, 12, 6] },
        { id: 1205, title: "Remix", artist: "Flip", type: "Mix", video: "V1.mp4", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3", desc: "Reimagined.", songs: [11, 5, 2] }
    ]
];

const lyricsMapping = [
    // Add exact LRCLIB track_name and artist_name mappings for your songs here.
    // To hardcode your own lyrics in any language (Hindi, English, Hinglish):
    // Use `customPlain: "line 1 \n line 2"` for simple text.
    // Use `customLrc: "[00:10.00] line 1 \n [00:15.00] line 2"` for time-synced lyrics.
    // e.g., { id: 1, customPlain: "My own hinglish lyrics here\nLine 2" },
    { id: 4, lrclibTitle: "Ishq Mubarak Refix", lrclibArtist: "Arijit Singh" },
    { id: 12, lrclibTitle: "Tera Yaar Hoon Main - Madhushmita", lrclibArtist: "Arijit Singh" },
    { id: 6, lrclibTitle: "Khairiyat - Chhichhore - Pritam/Arijit Singh", lrclibArtist: "Arijit Singh" },
    { id: 16, lrclibTitle: 'Sitaare (From "Ikkis") - Arijit Singh', lrclibArtist: "Arijit Singh" },
    { id: 1, lrclibTitle: "Shayad", lrclibArtist: "Arijit Singh" },
    { id: 2, lrclibTitle: "Apna Bana Le", lrclibArtist: "Arijit Singh" },
    { id: 3, lrclibTitle: "Kesariya", lrclibArtist: "Arijit Singh" },
    { id: 14, lrclibTitle: "Khairiyat (Bonus track)", lrclibArtist: "Arijit Singh" },
    { id: 18, lrclibTitle: "Roke Na Ruke Naina - Smoothest Aashu", lrclibArtist: "Arijit Singh" },
    { id: 24, lrclibTitle: "Yeh Jawaani Hai Deewani - Pritam; Rekha Bhardwaj; Tochi Raina", lrclibArtist: "Arijit Singh" },
    { id: 29, lrclibTitle: "Chahun Main Ya Naa- null - Palak Muchhal, Arijit Singh", lrclibArtist: "Palak Muchhal, Arijit Singh" },
    { id: 40, lrclibTitle: "Darkhaast- Shivaay - Mithoon, Arijit Singh, Sunidhi Chauhan", lrclibArtist: "Arijit Singh" }
];
