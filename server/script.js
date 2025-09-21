document.addEventListener('DOMContentLoaded', () => {
    // --- User Session Management ---
    const loggedInUser = sessionStorage.getItem('fantasy-fishing-username');

    if (!loggedInUser) {
        window.location.href = 'login.html';
        return;
    }

    // --- Element Selection ---
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('main section');
    const feed = document.getElementById('feed');
    const userCatchesGrid = document.getElementById('user-catches-grid');
    const logoutBtn = document.getElementById('logout-btn');
    const profileUsername = document.getElementById('profile-username');
    const profileAvatar = document.getElementById('profile-avatar');
    
    const fileUploadInput = document.getElementById('file-upload');
    const imagePreview = document.getElementById('preview-image');
    const fishInfoContainer = document.getElementById('fish-info');
    const submitCatchBtn = document.getElementById('submit-catch-btn');
    const uploadBoxLabel = document.querySelector('.custom-file-upload');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    // THE CHANGE: New selectors for description and location inputs
    const descriptionInput = document.getElementById('description-input');
    const locationInput = document.getElementById('location-input');
    
    const leagueCards = document.querySelectorAll('.league-card');
    const backToLeaguesBtn = document.getElementById('back-to-leagues-btn');
    const leagueDetailName = document.getElementById('league-detail-name');
    const leagueNavLinks = document.querySelectorAll('.league-nav a');
    const leagueTabContents = document.querySelectorAll('.league-tab-content');
    const leagueFeed = document.getElementById('league-feed');
    
    const joinLeagueBtn = document.getElementById('join-league-btn');
    const createLeagueBtn = document.getElementById('create-league-btn');

    // --- Dynamic User Data ---
    const userAvatarUrl = `https://lh3.googleusercontent.com/rd-d/ALs6j_Ft9nXQPi1OHeqo93W6LaVvxD5NyCgQQxBeOR4PLFZ02z-XvSq_ipU-k0nAyQg2Q_zX6KcrtWYV6HU0hVcB9mRm9zoGdlQ5Jq03PmP5dufSl_vgRmTKOQ-ju8KaDS-jjokdTJu23hOwI987AaAX5DTtHJlvyiTO2Yb33K02NbvCDr1U6ZMntpxvQeqv8reekDxclolk3nJjEkKCWNn95N4IrJ5lAD0NaHZX5c2Yu-3hgRM8z2fqgA1RAY6-eUCfGgO_1cZ5pa_ce546VMSfttxwMW5YWUtThO5QuLsTi0QYjwf5G3aXS3TWhCqUYJXky05B3z2rsdygVf9E1VUt03rDEFe_vtXDWfGCzYUWTNjJXz0bVGS176OlOTtFbsiUJPABIVM1f_g0soqaVqqJ-jQGjGDWFL-a57-jHioRiuXssMhkY8g_f9tWB2WOOnS8jITbKHNr8Nm-sLYKv1v1HEbNbgdOUD0AGO9P8jkXKdHnj8wXiesDcvS_xAAeb2KiTv1wSIsp4I9ijY4NQ-KiOhvhZ9smJ-H5P342wPbasKxzCmt0NqqxjszQI4FJZilN4SXLi2D61JSFxWNIgqo0HYwLVOQH88Vp_VILkfVKaKEyNzDPiUtwLBkkr2Kf8I7Ya6r1qt-pL1_fFOFMSKi0_A4K83_dQVwWD-fGcbigOm-31za8BeOZFqSTlK7hEObQZGqFrw-k9gnRx9K4CFwSt510SkX-seReevnwkL0jlJheHFjK1KYOn5SWoiPEemaDsEGJU966CmkGSpsjdJnTywFnCbhM4rV4ii-OtQw1SZRUDEvrqFq4CZKrFIDhsZv7vM_DQel8FF7s9t_eF_YEG-PhLlpuQvox_rI1Czsv_ML4Zaet653z6T0AQnQKeCDb1pX05QpaOcW-ZOaYiA0v-_7xytuY_7XKm_EuSMBr08DMiUSnlXxCHkTJii7SswDpd76ouex148SrKx3hATx7-L-GTBsooYVZQxTcZhE8up6l8rUgjpWZpM3JZZIbjTrk=w2256-h1166?auditContext=forDisplay`;
    profileUsername.textContent = loggedInUser;
    profileAvatar.src = userAvatarUrl;

    // --- API and Data ---
    const API_URL = 'http://localhost:3000';
    let currentCatchData = null;

    // THE CHANGE: Updated mock data to include timestamp, location, and description
    let masterFeedData = [
        { username: 'Aadit', avatar: 'https://lh3.googleusercontent.com/rd-d/ALs6j_F82c3j0d2LFgpqHx7LKEknh-dhVfmwt7GuSSm7Q4OWIgN9GmsaKHT05f2ynNZtHFjF9Lphn5O2h-X1LVWQw2o90UrXmiAlqOCWC0QzUp9BdloW_wN3z4-WA9sKAdLuMq7UGQ2MHFMFtsg5QuNs5BN7tPAENknlhKy87tAIubzIDS34UKP5MTnf6yQamXc80LESnNy-TbIQnhyGPtkMJ7gI_jQuYrI-ITJVPos0QMOHyHMKQQzcHp5rWX9GHvW8__fEsS37rFWKNE8C-JJUBGrE2xtfoK7bIjMbAIUFUYFxzLz-PCcUfiFTi7Etc27m_n34AJ9qEhHOmoyOTJ4W_VLvRyPEU1l980f4NUPcUXiQ6dByTDNE2a-jdBPWSLXpG2_fyHJVPndmfoqmvuDwppdmRjaGe8B5DXFBrcBGxcIox0FYqmIAuYoFQeLgZ38zUYjF_nb7E-FY-oHiMlhynTfzAPmEsVeq2Hry5otRUseTCZgaCcAeiANUspS4BAcYZn0vE6GZEMBS_fqWD-p_VSat-eTQ5DT1brrP6OapB08rGXr1r39m4LhewMgO5emRdE3rON8mpt5AjEdM5x3ruLSEh8tyTyPi2IaBGvAli6TVl65M5BO65bq-vaI3CINhSSFNFMcWawN78TnCchm8ft1zNe5U06GdVsbh6TaQB6B0wOBSOGESWcfRf-K2GJ_wsW3QTF0lj7ohEdAw-6qIu5jnoGWcICxlL6XYDjQUa3afFidN9m30-FiRLrxW9gfH6E9hkB5gIaq5rEKbNp98AWsDTXZGdZdkAQJlVlmIbhyiQwllEOS91QlJCVrYuBFv5dQ1Ln42IDVCp7NtE6VWQ6anLobDe0spJ8giNmfHf0f3VS36wLoVTp1Sr-_frDPgSeBi-X5p5X8kcDgsSJTRp3bX_nuHJMRlR2snCOu0csXLZmS3ayePuf24ZFOzXfpk-AoVBiYFDnlq0jieYNcxhyDPCoDt9OxGb0JpFuhb51OeR33Nbuu2dv_WvMOoJ8T4yg=w2256-h1166?auditContext=prefetch', species: 'Largemouth Bass', weight: '2.5 lbs', length: '18 inches', points: 50, imageUrl: 'https://lh3.googleusercontent.com/rd-d/ALs6j_FoPSyFBFJmkZUxenz48ZVPLjhSPoQlrmPdREYzpSqufPmBuM9cE27DyDmqd8exJ5giQZ8mx5IWesVmbCx-suBm4e1d_EXiScMRhiteyeb3ylndcQpIFtY8hCX-4TEHuzX6z4hatlLov2BVf8Rv4KoU7vHAypsuPr3w3b8-Q_6jJ5cpQMkPpG4wNcn-xLCmGXWQsvmIUERZwTtIcyykoD9KB28IF7q-QzRfapVZtFxEsHLrSkZm5k-kWDzQ_yOQDZSKg9NpwP5OfygXzyRWr3GgmhN3xZxCMHfb38y3p6DE4d_qiTC9vO2GzjOUvPLKkcsfzI779aidcJzdmv-zI6Wp7Qb4DQrtU-p5qcE-yMV5pegSGIiAXRtowzatZl4aP0CngGPMP6uzTgw6KYd9FAz6ImTDnZ4p75rJygaPhuBUMuN6N3v7QKngoNW_eeVrczA3aAjGgH3t2YQgrzFXNZkQ5B-gekF7AGXZEtIPUy6Bfp2UcxJ6DamxyVGLxSmKGFAR3ylvEY8Eg_Q4jvsxxv8XuyqicjVtNcx-q-dqrrwZEPLFDRryrbQUFC1WEc7eDnS8RdgszSaRp6JcorWNcLS0kwqKbXN3kF4ei4pTCGNHfyDZ-SjfL3OtUfjUNpGNFhb6G9Mxo7Ifxzzw2L9VHkx2U6JPlgqrckKAdpAotLabspYXFWxqpL4R9MxdbPoBZvvXvxSU-cUht7EzzG-37_bRS7icmeVN41I36VdNa_p0cc9uO7k4ph6DJ0vt6nATOxlhZjYdP7ELjCx010iN_UMvn9wLR1y2S_cZI4GNkMOvQ86g8wmEgGVgt2ZrcD9FaoakIrNperZXsqmkLtDGZM23vF9sNXhGzxdw6V-Afb1hIha0njG9Bs7HnjYluSqbqd91LRO4_iNkfc-DhGoaQWuIsi9gswr-h3pKO9hQT3jcqrfmyFuY9cpSUZxWZ3sr6aZTVikrJZzYsYipXp12Wkbszh7HA30sCEEWoOZTYUw0eGj7N25lXPMpEMcXcbHomZtRgua6wgA8hgQH=w2256-h1166?auditContext=prefetch', timestamp: '2025-09-18T10:00:00Z', location: 'Quabbin Reservoir', description: 'Off da boat on a wacky rig' },
        { username: 'Daniel', avatar: 'https://lh3.googleusercontent.com/rd-d/ALs6j_Fdy3FyXBxvavPGKvKK5GQwn3CnczT-PGnR8Mt2dC6uSp3-q66wGzT0nIZOJgrLEz2A1UTcc_XXr9avvvmdlG5aizm76ma7fnKFMzWoXqjdt7_TETwabHNBhyaD5fnu3-9gRYiUbsw_dpQqB7RW7mZ3n3xCCkxjYQsT0aXRtOYwiAeENmvPlB0LgHzT7j7JNeuBC04AL84L80-E9V82U3bfIj4_MIgKGi4Ly45HFYOqRs0McNIgO4CZXcQz1GTyllgqRN0e6-nPBi4RFImykJLZlTtzJTVbnpPOVTHeWqBxQBQCJL5-lRpg9po5naOU5QM_UIvZSCI-ZiH5nB5SulGu4O9byGnvl3QAYkUuqICPTTR8mndc01T1yectSZfLp7BX978vAy9xYHvMybYHqNkqnFzVJL8qT-xNZ0deWecOzDQvpQcw-Kbuh4eetN9q4-60ZPEDmsmXCZUouU9vBFEB_rPrbz9Bhx4Y8VWXomQEOHMzv6rKpILKdOG5W5ysOKluzRo3dEB452gJxrm5_qtT8UudUUYEZx894sBzOPIITvje7j7U6kJKeCN6aQNJdSVBkqshY3og_KxeLtgzEVIdbrEep3rD9dyJ2EOWbFXCFCESJPimUx0NEEjNJj-z3l7HQymdQGcKX4kC-3GahWMZeCKWL54vFttWf-ftCG0aNQ9KElfECBk9i3XzD7A8ZtVyYGmvAXJg5xTV8FhPzlSEN7F-ua1SlWjexnbGKRG1alrtcZ2glwH3Wo6MqOXjEC7I2wjEoFjGUz6Q_inqLOSvwkNi8efY1Lw_o1ntnpHqZFTf-F2UZvoDAZCIifSLkIo0J-mJAP8HGsiUsbUK17lggvWKxu19yjDA1Fas2v1t0ZGRIuD11k0GeYqqLxQdqII-jH5UTvnKOYeUAVUMTYijfud1OsVSTkVEOYMcYW4pIAGFX3wDBif-CwBfzX9WMoGSQlsPRCeHjzJQcElu4CJgZwnB4TwUzQ6-j8q0lmL76q4yZ5R7LclgB2bVDlm9_ZDVTVy3fO2VG-GKdg=w2256-h1166?auditContext=prefetch', species: 'Largemouth Bass', weight: '4.0 lbs', length: '22 inches', points: 120, imageUrl: 'https://lh3.googleusercontent.com/rd-d/ALs6j_GNYs-a7vp3p3xbz6PQ8XFEfJN21yq2BDnRcRnABM9-ymBnoWVjufsMtcNROhY9nNBeJfFW1Au_HbjHbvqJZ6cNRGpL52GATUHGnLApIz_evp3HO_XuGKOs0YI6Ua7tErnufWMbC_geZRwYiDQ8bGp1D12zrxvRwvr-sDEkeNo0-NkzeT6X_JI0hGWhchcpraL5XBLXqe7Y7UZPSXg9H3elDEKrj8bKfoFzoslmiyfKamCLlJQHgoGbszRWcXGJvdx4x0yo3BaNQS6zVwWqP5eXtHtemejI2-DIovCYy3RR3rf_2qYLXyOtObYw7Li8zRtb55CfKcKTbSqFcdPfokoRn4TXjB98n2YdExY4Y_1VLcJIQFw0l1mw-tHUfkS1igMSVXCjAlo2XkcTDZ0ioA0-bH2L1ZgJC-P3OrYon8J3fq47IiqVcks12Fwyenax0aqJtQ8dBX2SfSKI4HH27gfygHAUwXGE9Wy03Wow2jZ2CuLux0gPO1WstnvA8DUMQEm56qHTkq-EYzeinW0h1iZYo0zDZHz25Y1RboUipFHazBuEbHXkDTel9-S_RrhNAexIl5OVAMVhuFGBdEe2Ka4gur0GOj2sKlELgQFbtqbC2AsdYh4ww3Jwf-nTxfin5qckhXfFwyuHI2EIVA8U8DjRHuivff7x6C2qSZ4zk8YCJtBFOJbAO6lEe0GOh5ibnyq1PKSlcvvUvVxy-liO7_wUZPxeu74Ne_kV5MD49VF9XbFp2wgRGcFpy8GhPcXD3cnj576YhGUgnBjcnrwxQCsqHhVbZl3eO3CUWX7XgLTpGjj0TlaHTJ_i9SkEH5pVLxKXYq6xX3W4PGA1x1zrh0RvYP6hJ2ZAUXYl7QiN5x6jLao2mselZVfAVBZ6Y6gFVf_wXkW8TOAHRfaLUjbGb8_ZESmrmNRkXYmJEtG7NwOgqZC8zSPHtLGhM2_pWzAJ1CAhRXn9Yqtpqx98zEiB2rRlEY5PE5kOpTs6Dfahcvi_JZzvNoDXSBgzyKkd3q19Dw=w1146-h1166?auditContext=prefetch', timestamp: '2025-09-15T18:30:00Z', location: 'Johnson Pond, Waterville, ME', description: '4 pounder on the kayak!' },
        { username: 'Gavin', avatar: 'https://lh3.googleusercontent.com/rd-d/ALs6j_Gw5Ce98INx2LA9RvO3PwXb4vQ4JF2vW-tmkc66SYMC9ZkS1TQYgY2Iuboetr6odBMOehQsGJykwh-bTELuA4dQoQV1WHsYYAiMapgkSTz2hql2w09E3_gjRPP2joqbmLwezRlrs6HJRa_RrRr-Dx0urRolJxffu6LW8LWg0_SnajCRP9YrIv2pQweZcoCEdNjwCv0JxW1i72zuxn9Vg4JZsceXiSJq5c5TqUAWVzMh6aEEQjSPpc3kCYpVLUMxYcEUQcR0dXhzyOTJnW7HgY31hgwc_PwBD3KJitsSEfQfnA4xU1RUZv415H7koq_oqcrowQ6n2DS-NKeO1HX7L25dRjlp2kcoeKhuWDeyw7hVwNcd4eJXv2GbBojdW8MeZn3EArot0guAXrHz5g76k7OgjDYAIgGJKaQBr_QRwma8S0rDmwO1fxRysR4PKOHIIST0NxEmneAXXHFWh41s-pqq1EbwlKNr0XG4yqwiEdyZ4shLMBeo-gBmRzlkQjW8xlyEc8VRJqeHuBH_qcItMIceU-qgMJfGD0k5L6_smQuBIA1JfYGbkqL2NgWKm36sUi7f-MF5KY4qFUEK3Ds7BkwX3uZQI-RwJfMvoO11X-rqyYabmSEZCw0mgUNsT62bZdVxhsHtquRpy96wpEpg_0GaqLNp8bQ4S1wPNqgmWsXGqU92wdzU6Ce4LbN3F5_nz22qE-dkUfqYinNj6759eatG4wWvWnflc9K_3arU5yucooDZckaTJpa2Wv_0OsIMZ7XT_kP-bgDgJlqtd2va0LHfOZqe8-cBuiiv0mCzt351TPPPDTjzIPJKKTLBFgBzetGVokM4UrigxK0wbgVSzVQu52OGwtf3k57za_-pkgqW2Ym2nDn1wujzXS3Dp5MYpV6-SXM5jIWMcQC-4rgHDvI3OuKWkXwwAwAOdMB2N8Z9FjHm3y7F1kbX6algThQPBd-E4DiM2CP2hmC8qzXJq3ibErDxCxnAOWjVbLqqE7oe4ScsVTdDhGidMctfmwoPI4NTu9fyyQZwqTYs_Q=w1146-h1166?auditContext=prefetch', species: 'Black Crappie', weight: '1.2 lbs', length: '8 inches', points: 30, imageUrl: 'https://lh3.googleusercontent.com/rd-d/ALs6j_HYNepOSgCd4IrE5R-xyCqXfwTvw8IrpeQxkYZ5fh9BM4LSQMJmcfi1oqoXhcOxoD1_w74GU6aeOopXHfmkkTaYiQTwkoAM_7kLJEyAFW-KuSe0NsqC3SBW74-IQyhzzAz03f7ymDAN6Dic1ZWdfpjwblLm03O5dNirbM1Oa-Xto0ikvBo4b7qegB2hnNpqVo3JVKnCuPAFXiln0Mh0fysX7_D9Q1hvLSDFbmB2KeCJNG7nsX0K7NvCXIp3i0Nb-Fx8cvCL_nNbm_1zIjkdqhuspUHoIGpT3iADnOVp1SleaYntzEZlPiOqh05IA93accb2U34whd3F3THJ3NqjI2ryMIOgOogsMq11byytm_xpsaoBatf9AqeFr98OkXhLFzpbuyVm_zxO4uLMQeGkuMjl95dKb2xm2QxY82vw2rzLLvBKqAGi0NhstGB8y9d0RI_eUheKOpoFYHOeVYtfT2Aq4sWt3KJZMHJXTc066NHnoPRWURkl1qBX4uyjlv5m9DnWERSFOOCqN5YEvxVDorlwMvT7-VpZfPvlMHZIXVqCtyh_8TDDUXwyT5BxP2ZSmf4zZfYGoHra-RmtvYZo5OR4T9MXQMOGOFTQApT-Gp36h3b9In4XVxh-JK4XSPyfif8NerGbhUbUAW_y1AKlyQVP_DRIHWtaCbsl_9cuI02ZM-tmlBAbLc-amr1w_FemNryuXkzvOZ0I9uXtOnhW5G1Y56G8KBt_rShKV9TsIhKdu6yN6KP5fCq-PwlbrxIqUjVD_z84pJTmkePWRyOBpBWsU9XFdVjF65L_AJFZINQsegBV0yQSxbsELA6GPqi8R7reWnG9zkd6JRslNiwwgHSmrN62VFqaMD3N_1kphEWYaLnvq-WzfwFJNjLjuALe1VogukT67LktT9kdmm8GlhQkoPeQsttHQoBGw-pFmi27pUTf1QyY-_OkP2s3cIO5dXWRy687U4GuvEbO5UPtOcFvarjLdoWgIp9iwAJRKP4enevKORKolkF-rLUV52V5MS1TofNNof8rAVtN=w2256-h1166?auditContext=forDisplay', timestamp: '2025-09-05T12:15:00Z', location: 'Mill Pond, Westborough, MA', description: 'Biggest Crappie of my life!' },
        { username: 'Eric', avatar: 'https://lh3.googleusercontent.com/rd-d/ALs6j_F2ofkxx3sjBXJwDfJEHgtYP3cuikJhwpT6PQT0gOi0cQGVc23CFcByGnc3ZpppTCwCQUKR9PobewNhHdbsn8hptsB367ifpPZ4Koo-Mwz_z6IxecJzD_gDWO15FPARJe5hLFXGgCjviosfLIrTsDSgtDNX1lMTQ2_o1zNrgSeU1Ee-UJJQEfZo37J_t9DTrIicj2mStDtWcPAseH8GQHPxMd_Nh-nqH75Exh05fSCuX4KdDPj79IW7VGGWSaAJFkDkAQK_Xk2Erffg6169BMflBZCrZrjfysDZdMKBme0WQGJDxwQhkuCJpd70vphg-LeNmI-HtqJ6a-fDa94JyGXnYO62K1DqsHE_tsaOifmXy9sn2Rj5zrR0QSY48cqP1BFP8cD8mSm83HtO7upC4YbQtN3gPO-Z2nCxIVA3nL9zALh0Z8hOLAS7VN5yagJA2Yo556n4tr6BofXvi0MGqKkEcT-WjqDclWqb5Zvy78qSq78Qps4O2O7QAT64GwIKFHhu5N9dZ8UTST-M9ytVV8ambVku9cjsB4043YxQv42CRMg91uMwBYhCXmMqqFK30QklHp6NhfjtWr9jvwijRNIhhorouaOwRqH9kwV0KCydIYf2phfYKOyBgOLaKh30aUyYrsP3V3Ylai4flQ4yZrTqzYJM-jUs5vjBMi1dGijGqPf8OWcM9aBl6BTTxtWGQ7hRoefBdlkFYBTdLSaAepxe_ZsK9bK5kmSWs1Sbj9MfLFa15GNzRWxXe89VQnIIpyhYv6s10HdFT5qy5sp_th1v7TdKIULqgHxsb8xA70v9V6W3-TUOjcKIUPz4hGavCqGxn2ryYZV-fwmUmfV5EYRzoKemkgliWKdryEf3YxFFxjXpr4Ohzq1yOlZONp5FEhsbwSmjlsrTRIfVIIpQZvOvVMxD3kJVHAkxyzlNVoWXXkJFGi-SF0WvZSb8KzOyXzwOotiioxP7uMENYmYu9-iHMLpizOQYlkYKgsJ_daDQ3iDxcuzcl447yqGGw0UAcQ=w2256-h1166?auditContext=forDisplay', species: 'Smallmouth Bass', weight: '2.25 lbs', length: '18 inches', points: 20, imageUrl: 'https://lh3.googleusercontent.com/rd-d/ALs6j_GMYbgq_0zo3L-8eTt3EKhnp65iSyP8XHvc42-cgyswr9VGnwckiSac5FiTibOvvHSYZV6KJf_U1A_SoJRG_YDuX-DDqLAKSm3Sc6PF8r64yjgdKdbODqfcQxqJyWlAYNp1K79p_obKjst7cgrUlJNWP8CHAECfnlFdHfSKNO3HsxUPal8Y_cLoUQj2YS0TjTktjMBgaBCPzvXR2S1SlxeSWTrqw7com-qGvhjC8pWf9XjxeETD6TaIADyNeaDy9PSrENU9jKP-gfB9OV-WHTEj_P3uxmlbfdUxbsV7SPflN1kvm0pUOT67EFlUTLul5wWqT4aBMQwkaqP4qvqqw7Wn6FnIY4V3egCvh6jA6ZU6ugtukT0t-u3HyVUC2FXwohrHkjnybUp9psAlT7bz3hjhBDhChN1MwXpSoOyrWfrvK1FAVWjHDwTSAdoP7ltiGuES_cf5HsL6LjWkIjyDeo0TrUbGZRDfkbkT3xGaGufJ2Lj4hZTlwmVUHjQv7EE5An9SoWYY0LBDsqXv3NS-T0TUaM9PHfp3F41Uj3C9IdbxNZkdaVCTz2FNzPUVFt8c_bxZ8xpb54gJ_Ra_qcRN7Siv8jQY44Ao4Y2M61k1m6rcz5DgVhBa5GbtvgyrPOt8ldjgIpaNlGwE2UgNIhxc1Xs-sCkeodrio6beAVZWOzWnxCRtc1N-_jxL2JWsx57Xyo7RRMTaGFuDzrNAYXxhHSUKPKaZOCdatqH1lAnlQ4Nbqhzji1-AqMUpVjV3F_EVe1T36uKaBQ4Vqea3Shk3pMrq2u3xaWfxu1lSnhCGQmAg_8HYLtWiHTbvcvwYc2O2sBN6Ww5htE0x3Nd6N4vO3-tbmXy4qiv2VUhZKjz9nYlhMQOHu7vRscBFahqwssuy3yw53W_ZqoHshdHxpdG9RAiLIZ7-2ZphkugjYFImchsWqg5coyvpeoKo3BhUZFKwjD6-BFGLpSI6gBsb5XLfx0B8Y5K-VdIyEtC1J9J7F0UNF0l-qmMnFFf2mWwNLbtG=w2256-h1166?auditContext=forDisplay', timestamp: '2025-08-18T15:00:00Z', location: 'Quabbin Reservoir', description: 'Nice Smallie' },
        { username: 'Akhil', avatar: 'https://lh3.googleusercontent.com/rd-d/ALs6j_GZgq2e1EtECOZgLqSDhq1-574rfgVmDQBMUUbEpZIxCq21RZUTk8TuP4j6_50wBE3ITm0yXS3nOuA3am82YWQJsV_qfBFFdLLV4-Lh2DLIl3yRAQUFfPWZCL-EDy-LdKkzlhMf5NUILp1scXXqCv71DEpAkbIxQal9sEEZ7_ziSVVtPr149AfFesVGwJXMzj0QrqTPnKrlbE_jvOrYp9nYRMDqzKGd7kZD6y2GdVjY6PHcxhuQjpZ3lMZs-jSqE-3a1OFYt9lKymyxUmFx5aQsibeZ-Bk5nu969bEpGEZlXv-bilcpKV5TcS0Iwakl1VNdO-y6OvM6XwpBB3AKD6_KmKU5jP1TPwrfvZyDRvRhlBnA2Yy44hxrDbhV9tsJ5i8PIf0iiOEmuQ2ptqP_CoqxKbO10Vhec4Qb6HpTjwqDY1I0uxCXoj43GoVVmZ1vpqsBy9Eayfdh9ph2LIyG1NZbzMoqpp9IEGjRa1plY2n9TvJxLKUGqqaL8ecQzIYDPDRwTENQ7AzbfhstJcAcRv4xd4F7a9z8FoDeOg1h3JLtr9C35BrIByP59DZIRmC0YkWoRq_bJV9yrPZ0lV8TMZJc4bdDaW7uTJ7-qkKI6SiFOQ8sGAdtwkZiDCaYX1WUMvXqX-H1h8O2S9y-6c-F0JO0gezKXQL0jzN8emevVL0c1RvK4z3QTxA_L2M9Wvwo1Y_7vD8wBXiTxDy7urlpaifZ9a1VzDLlOB1pZWvzZXJJyA0MnqpFe4mM-2PJVEgc3Hy6RQ78AF8CTqSpFL6lYtTUdYxKNvgT1SwQewK0_FS55x6PIRXPMKyjYl0Cor9huE4exUdf0QXniwGkqJgBnu8ET7esYwM2yXUs1EQjmQRy0tjN-SXh0CS0bURSqyMMUJC5eY0ZTMfsjGckOBD1w04cFzuOQR4NBXwOCdVKs6k1POBjkDSdR2zTKph6RQ85CuVVSTyDD_Nl_rhnusOdiAfmyOLrl3rOHh0zEbPcMaBCHfMINZEBK0eoa9jQhiKmLskTxqQ8jU0OK3XskQ=w2256-h1166?auditContext=prefetch', species: 'Largemouth Bass', weight: '0.5 lbs', length: '8 inches', points: 20, imageUrl: 'https://lh3.googleusercontent.com/rd-d/ALs6j_ECK7iG1HJrO0_MLu7O9ZvrkqhSnl6gGum2iY1QJiVGCl6z4l9mnqfX7UFFWHz0cmJzVVmXauxKjAhm5qh1flbdBYYMkYZFFJ0CLorNKCeT1AFudJkJn68qDu3WIvhTZxDMXrMJYPcYIzym-P6mLlV69lvrWWAR071k7mGEdBc1NAWjvrNWNx18ct1CYduq072KZ_bKiNH6j0iU8T6920BGsgTAzwSPPT60PnFK31LuT3qt9Ccd8YxFLuE3_DPR-KmXpC7JLQZuadTzfduUxMgaqO0aIxTEkCWnRPCYTNjYRe41bzgwFvKaI7Mnpdc9USBkjmUdrV-gqODXo2zu_QpIjLJxASV76jvgHemGi789lB_kQ7NQWBAcLre-dqCF_qKTdn2AY5jIndYc8Gw8qqCPT6uAVXnVtw6Vye1xUo9ePMwimvhZmojB6ccCqL9hiDNxJ-BE_5e-0nUAeGeDxJu7akyd-4k3fvWse1NV84c8FryA8wXihFgUkoD7MaHqp2bFc9MgIVyFAcTkrhIvrlUTD7ymYAT78hG4ZnFHrlktZO_KV7TjNehDgA2HJ5uGy29uWRSZPleqxD858-fbCNphdRBN_ZGtp_iLcWglLxfwDrl2jEgxgHuYMHNwiuMvRt4BJpTMVuxxHOfa4uZuvKZOHNyQ0AHq-qDL6h7SGIVRGoieYVxmeSawsw9tLi6BJY9rM_6gKNecKYq4sjPXVT10UDQjaBv5SrJuiyNBaKABSRXEfjDUMBCVBZlKLwnX9UH7tfVJll8pGcjBZdy1x031lKnXFJKLY5yuRpZzw-N_XZHANSB19HwTxaEFNgK-vH49VvFAZmToa3GKDZ_XcnDYYBbritd9h8_agVjyyrhvm4bcZxR0yCbG3l_IA_dMGpojWER2fsqmQ5DDf_r7KuQ2pJD_730yZucNgLFw6rAMYNsx78Opm0PfrVHuNrbeWo7FRxWsODGToh1ekUK3nHmKd1G2-G7YaIKS19GkUFPSEN-weSKmxTmkkoWdMZ31Cpqxa6UYgpDDOD9d=w2256-h1166?auditContext=prefetch', timestamp: '2025-08-18T15:00:00Z', location: 'Sandra Pond, MA', description: 'Dink :(' },
        { username: 'Nick', avatar: 'https://lh3.googleusercontent.com/rd-d/ALs6j_ERmd8rgpiEwDO7RcSRfhdmBc0SxZvOrEg70i4WhXaXFtyrZAuZElODMibQws1ZwiVxjlPl9vZWqSLi26DCfxnmMQGmijmWhykEZ_APuHI4kCT31obbFchgqqwVLUp8pmj4zVJ5oVNod4N-5mrOQGVMbQPJmP-0G7ygAEzwqtrBiUWKCvIkuE_SkJMhahnj2hU2Yi_sXKajh15Nqzj3t45dkHcTbK3Mbf0ezYaOmXAIFmEwc8cdzPWFZM9F1a-X2p0XdyKikdo0hElvjw7yBl1xcjknitSFFdoAMOG_2Dk9To5mdlfTfpJVLSFlF7-XSayfmr2CkfOOpJC4BwXjthBXiQspM5yrQl0rIzh4IHLCFjG-RPke_ue3m3oFWkaO2wHZzZ2rNRLzmE7bUf207sJaX1kXm5rWwphxIcypVal0x6mnHADOf4o8o-DzbiH-L9VlKw-GXG4t2NXBZkCs8-_l8JUiEW-BH6YBTbXMqZK7m7uDDMuDWLQrwd0F0YpqmMHs77MXx4LgCwLqYH2hdZCWYMGbj4K-9XhrNGXPZKcCXVSVSRVO7qA5SlKuvAeujyjOHSPDzH-g8MS0A91v6imd3YVIzfy5u9zRN0zT20WXBjdKeZ386f26ygZPL8WvW-THPKg_S4Jo3ud45xVPNxLMBiCoMpSB8ey3qyhXvXnyepMyPVDRe_0Terlq35PMFPQdPQfEugSRNZ8NBJ5gE2iriVzJ3URUGAPoX-otusGm2W2q2ZTkr4ywHm3aym64i3mmPKnQtoOdr-zdn5vrl18LMPiEkPUN_02Oq8roWAuOW-nEms0nqsw9iY2P0y6t8VNUGrXCvJChGsgbr596kbaI1NLHaX3PlPBnQbc-_vwMXHqAkh3e7lUJYilaQwvXURBXuBwaou2wct71fYiHwJKfdhS-u91zUn54K0iWUX2taa9HZBeEqRcaWv3-I1MQX4QzLLmOd_vBjsVezuCP7S_BzefQqWaP2f5_oSheJ1q0LFdGyTBjj3hPewSHFfRQI-RaTeGp1spWlqNGhw=w2256-h1166?auditContext=forDisplay', species: 'Summer Flounder', weight: '2.1 lbs', length: '14 inches', points: 60, imageUrl: 'https://lh3.googleusercontent.com/rd-d/ALs6j_F4Nf81aQV85909K_1Nwq9U581sZnI3iotS4p-5lY4xejwVdMSZmcZaFTfj4zGKHUVh15q-Mp8o3t1gyFYq77FnYhqM5rPsQ6GjFoJ29pSMKdJiACvSVvZU5eRyz9tS0a-vdKD163WAzvhEWsj2b-4xvK63qvkRk3WPeGZtIpfXphRRNxQ_JVtuhaRrk_vHGyAZmZJ7Ob0F62WdU4FwyBSYzlALI_onr_raDNS_lmivqYLE4mi34OqKm1F-5zqKkoapZIVOZ0IN3wstd-XQYEuwI10pwhLYjJzzSNOfW1v0bUL4DgDRGOzFHHdD8Bb7JYxHEdPvIt7dVKVLDgxt4ZB93k4KVZBM8mXTFalJvQ5QMQi10zoq54ndcL597NSkRwl57EGDjJsBaq0X3dzEJTCyoI3CHxhWnK7R6M5zv0VpMjOitbMOS_ZLv3vhFS7952hp1npmv8LAaZkUWZ9NpAwGuDo9M-KpdTk8lq2xpboTi26_1cYOES87kf9G81T0qUOJPj__CukECdwPRIqGCjmGnKtRwrToO9MldS8ARhf7OdwtJVe8R0uzkHO8LiMs-C3PPqQThVSQk9roD5ySWX6FGWzIxwDyrH2BByIe1vF-TIDi3mVVcr0w0fz0mmdJqrV_WMSV-yViwDeUTqwGMsq03k9ibMeNcT1H0wmjmtlDgqyl_Wlfnt5OT8aMQvCZmeGrpBbCVh6YgN5Ab1VnBQFtMsrFbd0PSKLW8gKbXILt_EuOKFJFoi_-SSV9c8dEOgNmbZm7aaEoEH509Pq4WlE3ouFwYnZ5730dARuNjhmpAoQ3f2U1xcze865TI7In9-lVh14LoXNkLDcQNogYBmmzDwRc1FgKwIixqv4rRgbfxR3T1PVu9FV143TE2qKOalXHTDJ7I3L2OP4GHiiVbkLlJOTU_v1f5D5QgKFb2ur7hZdzaK439YCIX4MkmoZuK8f3D4HC3G-ZUHtC50G1HXUTvNxbPX8Zepwn6pNWbxlKg5POyI5LpOOcq_DUUyJd3bFvT_z-_tete8VwAg=w2256-h1166?auditContext=forDisplay', timestamp: '2025-07-17T20:00:00Z', location: 'Naranganset, RI', description: "Can't believe I caught that" },
    ];
    
    const leaguesData = {
        'weekend-warriors': {
            name: 'Weekend Warriors',
            members: ['Aadit', 'Daniel', loggedInUser, 'Gavin']
        }
    };
    let currentLeagueId = null;

    async function loadLocalCatches() {
        try {
            const response = await fetch(`${API_URL}/api/images`);
            if (!response.ok) throw new Error('Could not fetch images.');
            
            const analyzedCatches = await response.json();

            const localCatches = analyzedCatches
                .map(catchItem => {
                    const fishData = catchItem.analysis;
                    if (!fishData || typeof fishData.weight === 'undefined') {
                        return null;
                    }
                    const weightInLbs = `${fishData.weight.toFixed(1)} lbs`;
                    const lengthInInches = `${fishData.length.toFixed(1)} inches`;
                    const points = Math.round(fishData.weight * 15 + fishData.length);
                    return {
                        username: loggedInUser,
                        avatar: userAvatarUrl,
                        species: fishData.species,
                        weight: weightInLbs,
                        length: lengthInInches,
                        points: points,
                        imageUrl: `${API_URL}${catchItem.imageUrl}`,
                        timestamp: new Date().toISOString(), // Default to now for loaded catches
                        location: 'Unknown Location',
                        description: 'My latest catch!'
                    };
                })
                .filter(item => item !== null);

            masterFeedData = [...localCatches.reverse(), ...masterFeedData];
        } catch (error) {
            console.error("Failed to load local catches:", error);
        }
    }

    // --- Navigation ---
    function navigateTo(sectionId) {
        const targetLink = document.querySelector(`nav a[href="#${sectionId}"]`);
        navLinks.forEach(navLink => navLink.classList.remove('active'));
        if (targetLink) {
            targetLink.classList.add('active');
        }

        sections.forEach(section => {
            section.id === sectionId ? section.classList.remove('hidden') : section.classList.add('hidden');
        });
    }

    // --- Event Listeners ---
    navLinks.forEach(link => {
        if (link.id !== 'logout-btn') {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                navigateTo(targetId);
            });
        }
    });

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.removeItem('fantasy-fishing-username');
        window.location.href = 'login.html';
    });

    fileUploadInput.addEventListener('change', async function() {
        const file = this.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.classList.remove('hidden');
            uploadBoxLabel.classList.add('hidden');
        }
        reader.readAsDataURL(file);

        loadingOverlay.classList.remove('hidden');
        submitCatchBtn.classList.add('hidden');
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Analysis failed on the server.');
            }
            
            const result = await response.json();
            const fishData = result.analysis;

            if (!fishData || typeof fishData.weight === 'undefined') {
                throw new Error('Could not identify a fish in the image. Please try another one.');
            }

            const weightInLbs = `${fishData.weight.toFixed(1)} lbs`;
            const lengthInInches = `${fishData.length.toFixed(1)} inches`;
            const points = Math.round(fishData.weight * 15 + fishData.length);

            document.getElementById('species').textContent = fishData.species;
            document.getElementById('weight').textContent = weightInLbs;
            document.getElementById('length').textContent = lengthInInches;
            document.getElementById('points').textContent = points;
            
            currentCatchData = {
                imageUrl: `${API_URL}${result.filePath}`,
                species: fishData.species,
                weight: weightInLbs,
                length: lengthInInches,
                points: points
            };

            fishInfoContainer.classList.remove('hidden');
            submitCatchBtn.classList.remove('hidden');
            submitCatchBtn.disabled = false;

        } catch (error) {
            console.error('Error analyzing file:', error);
            alert(`Failed to analyze catch: ${error.message}`);
            resetUploadForm();
        } finally {
            loadingOverlay.classList.add('hidden');
        }
    });
    
    submitCatchBtn.addEventListener('click', () => {
        if (!currentCatchData) {
            alert("No catch data to publish. Please upload an image first.");
            return;
        }
        
        submitCatchBtn.textContent = 'Publishing...';
        submitCatchBtn.disabled = true;

        // THE CHANGE: Get values from new inputs and add to the new catch object
        const description = descriptionInput.value;
        const location = locationInput.value;

        const newCatch = {
            username: loggedInUser,
            avatar: userAvatarUrl,
            description: description,
            location: location,
            timestamp: new Date().toISOString(), // Use ISO string for consistency
            ...currentCatchData
        };

        masterFeedData.unshift(newCatch);
        renderFeed();
        renderUserCatches();
        
        navigateTo('feed');
        
        resetUploadForm();
    });

    leagueCards.forEach(card => {
        card.addEventListener('click', () => {
            currentLeagueId = card.dataset.leagueId;
            showLeagueDetail(currentLeagueId);
        });
    });

    backToLeaguesBtn.addEventListener('click', () => {
        navigateTo('leagues');
        currentLeagueId = null;
    });

    leagueNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            leagueNavLinks.forEach(navLink => navLink.classList.remove('active'));
            link.classList.add('active');
            
            const targetTab = link.dataset.tab;
            leagueTabContents.forEach(content => {
                if (content.id === `${targetTab}-content`) {
                    content.classList.remove('hidden');
                } else {
                    content.classList.add('hidden');
                }
            });
        });
    });

    joinLeagueBtn.addEventListener('click', () => {
        alert('Join League functionality is coming soon!');
    });

    createLeagueBtn.addEventListener('click', () => {
        alert('Create League functionality is coming soon!');
    });


    // --- Render Functions ---
    function renderFeed() {
        feed.innerHTML = '';
        masterFeedData.forEach(item => {
            feed.appendChild(createFeedItem(item, { showPoints: false }));
        });
    }

    function renderUserCatches() {
        if (userCatchesGrid) {
            userCatchesGrid.innerHTML = '';
            const myCatches = masterFeedData.filter(item => item.username === loggedInUser);
            myCatches.forEach(item => {
                const catchItem = document.createElement('div');
                catchItem.innerHTML = `<img src="${item.imageUrl}" alt="${item.species}">`;
                userCatchesGrid.appendChild(catchItem);
            });
        }
    }
    
    function showLeagueDetail(leagueId) {
        const league = leaguesData[leagueId];
        if (!league) return;

        leagueDetailName.textContent = league.name;
        
        renderLeagueFeed(leagueId);
        renderLeaderboard(leagueId);
        renderMembers(leagueId);
        
        leagueNavLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.tab === 'leaderboard');
        });
        leagueTabContents.forEach(content => {
            content.classList.toggle('hidden', content.id !== 'leaderboard-content');
        });

        navigateTo('league-detail');
    }

    function renderLeagueFeed(leagueId) {
        leagueFeed.innerHTML = '';
        const league = leaguesData[leagueId];
        const leagueMembers = league.members;
        const feedItems = masterFeedData.filter(item => leagueMembers.includes(item.username));

        feedItems.forEach(item => {
            leagueFeed.appendChild(createFeedItem(item, { showPoints: true }));
        });
    }

    function renderLeaderboard(leagueId) {
        const container = document.getElementById('leaderboard-content');
        const league = leaguesData[leagueId];
        const scores = {};

        league.members.forEach(member => {
            scores[member] = 0;
        });

        masterFeedData.forEach(item => {
            if (league.members.includes(item.username)) {
                scores[item.username] += item.points;
            }
        });

        const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);

        let tableHtml = '<table class="leaderboard-table"><tr><th>Rank</th><th>User</th><th>Points</th></tr>';
        sortedScores.forEach(([user, points], index) => {
            tableHtml += `<tr><td>${index + 1}</td><td>${user}</td><td>${points}</td></tr>`;
        });
        tableHtml += '</table>';
        container.innerHTML = tableHtml;
    }

    function renderMembers(leagueId) {
        const container = document.getElementById('members-content');
        const league = leaguesData[leagueId];
        let listHtml = '<h3>League Members</h3><ul class="member-list">';
        league.members.forEach(member => {
            listHtml += `<li>${member}</li>`;
        });
        listHtml += '</ul>';
        container.innerHTML = listHtml;
    }

    // --- Helper Functions ---
    function resetUploadForm() {
        fileUploadInput.value = '';
        imagePreview.classList.add('hidden');
        imagePreview.src = '#';
        fishInfoContainer.classList.add('hidden');
        submitCatchBtn.classList.add('hidden');
        uploadBoxLabel.classList.remove('hidden');
        submitCatchBtn.disabled = false;
        submitCatchBtn.textContent = 'Publish';
        currentCatchData = null;
        
        // THE CHANGE: Reset new input fields
        descriptionInput.value = '';
        locationInput.value = '';
    }
    
    // THE CHANGE: This function now renders date, location, and description
    function createFeedItem(item, options = { showPoints: true }) {
        const feedItem = document.createElement('div');
        feedItem.classList.add('feed-item');

        const pointsHtml = options.showPoints ? `<p class="points">${item.points} points</p>` : '';
        const date = new Date(item.timestamp).toLocaleDateString();
        const locationHtml = item.location ? `<span class="post-location">${item.location}</span>` : '';
        const descriptionHtml = item.description ? `<p class="post-description">${item.description}</p>` : '';

        feedItem.innerHTML = `
            <div class="post-header">
                <img src="${item.avatar}" alt="${item.username} avatar">
                <div class="post-header-info">
                    <span class="username">${item.username}</span>
                    ${locationHtml}
                </div>
                <span class="post-date">${date}</span>
            </div>
            <div class="post-image"><img src="${item.imageUrl}" alt="Catch by ${item.username}"></div>
            <div class="post-content">
                <div class="post-info">
                    <h4>${item.species}</h4>
                    <p>Weight: ${item.weight} | Length: ${item.length}</p>
                    ${descriptionHtml}
                    ${pointsHtml}
                </div>
            </div>`;
        return feedItem;
    }

    // --- Initial App Load ---
    async function initializeApp() {
        await loadLocalCatches();
        renderFeed();
        renderUserCatches();
    }

    initializeApp();
});