'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">tunein-backend documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AppModule-59b7a008686a8df12b84ea0b19c29e097c95a27d60bfd499ba84df1eab4ce1177dbc0d1f2d6b52900671e457d9eb9a1ea4361a55980a93833cc7308646c61452"' : 'data-bs-target="#xs-controllers-links-module-AppModule-59b7a008686a8df12b84ea0b19c29e097c95a27d60bfd499ba84df1eab4ce1177dbc0d1f2d6b52900671e457d9eb9a1ea4361a55980a93833cc7308646c61452"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AppModule-59b7a008686a8df12b84ea0b19c29e097c95a27d60bfd499ba84df1eab4ce1177dbc0d1f2d6b52900671e457d9eb9a1ea4361a55980a93833cc7308646c61452"' :
                                            'id="xs-controllers-links-module-AppModule-59b7a008686a8df12b84ea0b19c29e097c95a27d60bfd499ba84df1eab4ce1177dbc0d1f2d6b52900671e457d9eb9a1ea4361a55980a93833cc7308646c61452"' }>
                                            <li class="link">
                                                <a href="controllers/AppController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AppModule-59b7a008686a8df12b84ea0b19c29e097c95a27d60bfd499ba84df1eab4ce1177dbc0d1f2d6b52900671e457d9eb9a1ea4361a55980a93833cc7308646c61452"' : 'data-bs-target="#xs-injectables-links-module-AppModule-59b7a008686a8df12b84ea0b19c29e097c95a27d60bfd499ba84df1eab4ce1177dbc0d1f2d6b52900671e457d9eb9a1ea4361a55980a93833cc7308646c61452"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-59b7a008686a8df12b84ea0b19c29e097c95a27d60bfd499ba84df1eab4ce1177dbc0d1f2d6b52900671e457d9eb9a1ea4361a55980a93833cc7308646c61452"' :
                                        'id="xs-injectables-links-module-AppModule-59b7a008686a8df12b84ea0b19c29e097c95a27d60bfd499ba84df1eab4ce1177dbc0d1f2d6b52900671e457d9eb9a1ea4361a55980a93833cc7308646c61452"' }>
                                        <li class="link">
                                            <a href="injectables/AppService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/MyLogger.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MyLogger</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuthModule.html" data-type="entity-link" >AuthModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AuthModule-ed707798bd9c4a5448954dc8701f93b9b7c4360b759a096693bad5830226643a927dee28240a05ae4712b4475aa60dc3193788a5f66fdf066eadd6010441dd13"' : 'data-bs-target="#xs-controllers-links-module-AuthModule-ed707798bd9c4a5448954dc8701f93b9b7c4360b759a096693bad5830226643a927dee28240a05ae4712b4475aa60dc3193788a5f66fdf066eadd6010441dd13"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AuthModule-ed707798bd9c4a5448954dc8701f93b9b7c4360b759a096693bad5830226643a927dee28240a05ae4712b4475aa60dc3193788a5f66fdf066eadd6010441dd13"' :
                                            'id="xs-controllers-links-module-AuthModule-ed707798bd9c4a5448954dc8701f93b9b7c4360b759a096693bad5830226643a927dee28240a05ae4712b4475aa60dc3193788a5f66fdf066eadd6010441dd13"' }>
                                            <li class="link">
                                                <a href="controllers/AuthController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/SpotifyAuthController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SpotifyAuthController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AuthModule-ed707798bd9c4a5448954dc8701f93b9b7c4360b759a096693bad5830226643a927dee28240a05ae4712b4475aa60dc3193788a5f66fdf066eadd6010441dd13"' : 'data-bs-target="#xs-injectables-links-module-AuthModule-ed707798bd9c4a5448954dc8701f93b9b7c4360b759a096693bad5830226643a927dee28240a05ae4712b4475aa60dc3193788a5f66fdf066eadd6010441dd13"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthModule-ed707798bd9c4a5448954dc8701f93b9b7c4360b759a096693bad5830226643a927dee28240a05ae4712b4475aa60dc3193788a5f66fdf066eadd6010441dd13"' :
                                        'id="xs-injectables-links-module-AuthModule-ed707798bd9c4a5448954dc8701f93b9b7c4360b759a096693bad5830226643a927dee28240a05ae4712b4475aa60dc3193788a5f66fdf066eadd6010441dd13"' }>
                                        <li class="link">
                                            <a href="injectables/AuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/JwtStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JwtStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/LocalStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LocalStrategy</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AutoModerationModule.html" data-type="entity-link" >AutoModerationModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AutoModerationModule-d570481f36841913c5484949b978271f59118f37136a3051b58b9f52fd1bfb7f8cacf929abd3beeb09e5ffbe8f0a438d18b2e3b56edf7ae07a734a8dcc42ee25"' : 'data-bs-target="#xs-injectables-links-module-AutoModerationModule-d570481f36841913c5484949b978271f59118f37136a3051b58b9f52fd1bfb7f8cacf929abd3beeb09e5ffbe8f0a438d18b2e3b56edf7ae07a734a8dcc42ee25"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AutoModerationModule-d570481f36841913c5484949b978271f59118f37136a3051b58b9f52fd1bfb7f8cacf929abd3beeb09e5ffbe8f0a438d18b2e3b56edf7ae07a734a8dcc42ee25"' :
                                        'id="xs-injectables-links-module-AutoModerationModule-d570481f36841913c5484949b978271f59118f37136a3051b58b9f52fd1bfb7f8cacf929abd3beeb09e5ffbe8f0a438d18b2e3b56edf7ae07a734a8dcc42ee25"' }>
                                        <li class="link">
                                            <a href="injectables/AutoModerationService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AutoModerationService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/BullBoardModule.html" data-type="entity-link" >BullBoardModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-BullBoardModule-bc50279217d2b57b05799234f65504f330575abe5e850745a94f7fa3618b3492307ddc400c93e4f911d3424f03640f6b32b5e3f5188dcad2ba94faa7393c1568"' : 'data-bs-target="#xs-injectables-links-module-BullBoardModule-bc50279217d2b57b05799234f65504f330575abe5e850745a94f7fa3618b3492307ddc400c93e4f911d3424f03640f6b32b5e3f5188dcad2ba94faa7393c1568"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-BullBoardModule-bc50279217d2b57b05799234f65504f330575abe5e850745a94f7fa3618b3492307ddc400c93e4f911d3424f03640f6b32b5e3f5188dcad2ba94faa7393c1568"' :
                                        'id="xs-injectables-links-module-BullBoardModule-bc50279217d2b57b05799234f65504f330575abe5e850745a94f7fa3618b3492307ddc400c93e4f911d3424f03640f6b32b5e3f5188dcad2ba94faa7393c1568"' }>
                                        <li class="link">
                                            <a href="injectables/BullBoardService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BullBoardService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/BullConfigModule.html" data-type="entity-link" >BullConfigModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/DbUtilsModule.html" data-type="entity-link" >DbUtilsModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-DbUtilsModule-a39f8b22a867d5730e1a62aa368007fdffa9a03c026a544902370ec83576cf9048ebdd2dbe177c9bbd5702c80c15caaaa3e1d0c18e7b52e8c6123fd980d341cb"' : 'data-bs-target="#xs-injectables-links-module-DbUtilsModule-a39f8b22a867d5730e1a62aa368007fdffa9a03c026a544902370ec83576cf9048ebdd2dbe177c9bbd5702c80c15caaaa3e1d0c18e7b52e8c6123fd980d341cb"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-DbUtilsModule-a39f8b22a867d5730e1a62aa368007fdffa9a03c026a544902370ec83576cf9048ebdd2dbe177c9bbd5702c80c15caaaa3e1d0c18e7b52e8c6123fd980d341cb"' :
                                        'id="xs-injectables-links-module-DbUtilsModule-a39f8b22a867d5730e1a62aa368007fdffa9a03c026a544902370ec83576cf9048ebdd2dbe177c9bbd5702c80c15caaaa3e1d0c18e7b52e8c6123fd980d341cb"' }>
                                        <li class="link">
                                            <a href="injectables/DbUtilsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DbUtilsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/DmUsersModule.html" data-type="entity-link" >DmUsersModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-DmUsersModule-cbe638eeea3a95c5b0febe687eaec20959575598e2d34077a7f58ba897060653f0a6556d59ec8cbce91aba59d2e0e013fe9013e11fce59b29bca5b5a84bd9202"' : 'data-bs-target="#xs-injectables-links-module-DmUsersModule-cbe638eeea3a95c5b0febe687eaec20959575598e2d34077a7f58ba897060653f0a6556d59ec8cbce91aba59d2e0e013fe9013e11fce59b29bca5b5a84bd9202"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-DmUsersModule-cbe638eeea3a95c5b0febe687eaec20959575598e2d34077a7f58ba897060653f0a6556d59ec8cbce91aba59d2e0e013fe9013e11fce59b29bca5b5a84bd9202"' :
                                        'id="xs-injectables-links-module-DmUsersModule-cbe638eeea3a95c5b0febe687eaec20959575598e2d34077a7f58ba897060653f0a6556d59ec8cbce91aba59d2e0e013fe9013e11fce59b29bca5b5a84bd9202"' }>
                                        <li class="link">
                                            <a href="injectables/DmUsersService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DmUsersService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/DtoGenModule.html" data-type="entity-link" >DtoGenModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-DtoGenModule-d9fd4a3353cf345f29f2176f471de66dfd6471ac764183338cef04217481935ac0c473f261defe995cfa5d54d1d48533e23b7031a2a47131e0c5b2c2177f17c7"' : 'data-bs-target="#xs-injectables-links-module-DtoGenModule-d9fd4a3353cf345f29f2176f471de66dfd6471ac764183338cef04217481935ac0c473f261defe995cfa5d54d1d48533e23b7031a2a47131e0c5b2c2177f17c7"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-DtoGenModule-d9fd4a3353cf345f29f2176f471de66dfd6471ac764183338cef04217481935ac0c473f261defe995cfa5d54d1d48533e23b7031a2a47131e0c5b2c2177f17c7"' :
                                        'id="xs-injectables-links-module-DtoGenModule-d9fd4a3353cf345f29f2176f471de66dfd6471ac764183338cef04217481935ac0c473f261defe995cfa5d54d1d48533e23b7031a2a47131e0c5b2c2177f17c7"' }>
                                        <li class="link">
                                            <a href="injectables/DtoGenService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DtoGenService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/GenresModule.html" data-type="entity-link" >GenresModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-GenresModule-c949f347565eb8295596e9dddffb5ff171f33ec87ad0ab48eadf76ee606594a6b914ccddf99d30e4c8f105a48304b6aef4e08b5b000553c4d7915babb87fcacb"' : 'data-bs-target="#xs-controllers-links-module-GenresModule-c949f347565eb8295596e9dddffb5ff171f33ec87ad0ab48eadf76ee606594a6b914ccddf99d30e4c8f105a48304b6aef4e08b5b000553c4d7915babb87fcacb"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-GenresModule-c949f347565eb8295596e9dddffb5ff171f33ec87ad0ab48eadf76ee606594a6b914ccddf99d30e4c8f105a48304b6aef4e08b5b000553c4d7915babb87fcacb"' :
                                            'id="xs-controllers-links-module-GenresModule-c949f347565eb8295596e9dddffb5ff171f33ec87ad0ab48eadf76ee606594a6b914ccddf99d30e4c8f105a48304b6aef4e08b5b000553c4d7915babb87fcacb"' }>
                                            <li class="link">
                                                <a href="controllers/GenresController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GenresController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-GenresModule-c949f347565eb8295596e9dddffb5ff171f33ec87ad0ab48eadf76ee606594a6b914ccddf99d30e4c8f105a48304b6aef4e08b5b000553c4d7915babb87fcacb"' : 'data-bs-target="#xs-injectables-links-module-GenresModule-c949f347565eb8295596e9dddffb5ff171f33ec87ad0ab48eadf76ee606594a6b914ccddf99d30e4c8f105a48304b6aef4e08b5b000553c4d7915babb87fcacb"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-GenresModule-c949f347565eb8295596e9dddffb5ff171f33ec87ad0ab48eadf76ee606594a6b914ccddf99d30e4c8f105a48304b6aef4e08b5b000553c4d7915babb87fcacb"' :
                                        'id="xs-injectables-links-module-GenresModule-c949f347565eb8295596e9dddffb5ff171f33ec87ad0ab48eadf76ee606594a6b914ccddf99d30e4c8f105a48304b6aef4e08b5b000553c4d7915babb87fcacb"' }>
                                        <li class="link">
                                            <a href="injectables/GenresService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GenresService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ImageModule.html" data-type="entity-link" >ImageModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ImageModule-76a3d90322f55370525c0494a25e1d1f813493371a2bb3a460e33fc0bf899e1a1f95d7dc920bf8125bf25ba09a91769633d130d4545057f6387700dfbafda820"' : 'data-bs-target="#xs-injectables-links-module-ImageModule-76a3d90322f55370525c0494a25e1d1f813493371a2bb3a460e33fc0bf899e1a1f95d7dc920bf8125bf25ba09a91769633d130d4545057f6387700dfbafda820"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ImageModule-76a3d90322f55370525c0494a25e1d1f813493371a2bb3a460e33fc0bf899e1a1f95d7dc920bf8125bf25ba09a91769633d130d4545057f6387700dfbafda820"' :
                                        'id="xs-injectables-links-module-ImageModule-76a3d90322f55370525c0494a25e1d1f813493371a2bb3a460e33fc0bf899e1a1f95d7dc920bf8125bf25ba09a91769633d130d4545057f6387700dfbafda820"' }>
                                        <li class="link">
                                            <a href="injectables/ImageService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ImageService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/LiveModule.html" data-type="entity-link" >LiveModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-LiveModule-4d83f09552fb4d4a9b8f62206ea3dbbd0f000f7520eac022e6f11b6f36edb5efdcee97fdb3078beaeedfedb0b8a22eb385953573401fceab4d06b10577675de1"' : 'data-bs-target="#xs-injectables-links-module-LiveModule-4d83f09552fb4d4a9b8f62206ea3dbbd0f000f7520eac022e6f11b6f36edb5efdcee97fdb3078beaeedfedb0b8a22eb385953573401fceab4d06b10577675de1"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-LiveModule-4d83f09552fb4d4a9b8f62206ea3dbbd0f000f7520eac022e6f11b6f36edb5efdcee97fdb3078beaeedfedb0b8a22eb385953573401fceab4d06b10577675de1"' :
                                        'id="xs-injectables-links-module-LiveModule-4d83f09552fb4d4a9b8f62206ea3dbbd0f000f7520eac022e6f11b6f36edb5efdcee97fdb3078beaeedfedb0b8a22eb385953573401fceab4d06b10577675de1"' }>
                                        <li class="link">
                                            <a href="injectables/EventQueueService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EventQueueService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/LiveService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LiveService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/MockConfigModule.html" data-type="entity-link" >MockConfigModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/MockPrismaModule.html" data-type="entity-link" >MockPrismaModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/PrismaModule.html" data-type="entity-link" >PrismaModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-PrismaModule-efd133821ff493e6f21d16d48753f46d37006ad01f73b2c371bc666c867a89d6344d57f7ec1671962b2c1f1945f90a4210e906eaa5ea1a4d63f04af2ba5277ce"' : 'data-bs-target="#xs-injectables-links-module-PrismaModule-efd133821ff493e6f21d16d48753f46d37006ad01f73b2c371bc666c867a89d6344d57f7ec1671962b2c1f1945f90a4210e906eaa5ea1a4d63f04af2ba5277ce"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-PrismaModule-efd133821ff493e6f21d16d48753f46d37006ad01f73b2c371bc666c867a89d6344d57f7ec1671962b2c1f1945f90a4210e906eaa5ea1a4d63f04af2ba5277ce"' :
                                        'id="xs-injectables-links-module-PrismaModule-efd133821ff493e6f21d16d48753f46d37006ad01f73b2c371bc666c867a89d6344d57f7ec1671962b2c1f1945f90a4210e906eaa5ea1a4d63f04af2ba5277ce"' }>
                                        <li class="link">
                                            <a href="injectables/PrismaService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PrismaService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ProfileModule.html" data-type="entity-link" >ProfileModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ProfileModule-e11c6e0ac8f87fbd205d34166178b15f518ef6032ae1754bec33db3b380529252585e66aa82dcd74b70b7830685b289069e72ae8f01c9b591ad2cabe4f60e105"' : 'data-bs-target="#xs-controllers-links-module-ProfileModule-e11c6e0ac8f87fbd205d34166178b15f518ef6032ae1754bec33db3b380529252585e66aa82dcd74b70b7830685b289069e72ae8f01c9b591ad2cabe4f60e105"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ProfileModule-e11c6e0ac8f87fbd205d34166178b15f518ef6032ae1754bec33db3b380529252585e66aa82dcd74b70b7830685b289069e72ae8f01c9b591ad2cabe4f60e105"' :
                                            'id="xs-controllers-links-module-ProfileModule-e11c6e0ac8f87fbd205d34166178b15f518ef6032ae1754bec33db3b380529252585e66aa82dcd74b70b7830685b289069e72ae8f01c9b591ad2cabe4f60e105"' }>
                                            <li class="link">
                                                <a href="controllers/ProfileController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProfileController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ProfileModule-e11c6e0ac8f87fbd205d34166178b15f518ef6032ae1754bec33db3b380529252585e66aa82dcd74b70b7830685b289069e72ae8f01c9b591ad2cabe4f60e105"' : 'data-bs-target="#xs-injectables-links-module-ProfileModule-e11c6e0ac8f87fbd205d34166178b15f518ef6032ae1754bec33db3b380529252585e66aa82dcd74b70b7830685b289069e72ae8f01c9b591ad2cabe4f60e105"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ProfileModule-e11c6e0ac8f87fbd205d34166178b15f518ef6032ae1754bec33db3b380529252585e66aa82dcd74b70b7830685b289069e72ae8f01c9b591ad2cabe4f60e105"' :
                                        'id="xs-injectables-links-module-ProfileModule-e11c6e0ac8f87fbd205d34166178b15f518ef6032ae1754bec33db3b380529252585e66aa82dcd74b70b7830685b289069e72ae8f01c9b591ad2cabe4f60e105"' }>
                                        <li class="link">
                                            <a href="injectables/AuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/DbUtilsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DbUtilsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/DtoGenService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DtoGenService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/PrismaService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PrismaService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ProfileService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProfileService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/RecommendationsModule.html" data-type="entity-link" >RecommendationsModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-RecommendationsModule-3e281ef8f9e1ab840c5c91b432462638d61f5b26200c3a26cf2fc2c9f95e8628de7c90abfd6923892e0f4a75ce230ee673556e4852ad90c70e92c17a3040fd27"' : 'data-bs-target="#xs-injectables-links-module-RecommendationsModule-3e281ef8f9e1ab840c5c91b432462638d61f5b26200c3a26cf2fc2c9f95e8628de7c90abfd6923892e0f4a75ce230ee673556e4852ad90c70e92c17a3040fd27"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-RecommendationsModule-3e281ef8f9e1ab840c5c91b432462638d61f5b26200c3a26cf2fc2c9f95e8628de7c90abfd6923892e0f4a75ce230ee673556e4852ad90c70e92c17a3040fd27"' :
                                        'id="xs-injectables-links-module-RecommendationsModule-3e281ef8f9e1ab840c5c91b432462638d61f5b26200c3a26cf2fc2c9f95e8628de7c90abfd6923892e0f4a75ce230ee673556e4852ad90c70e92c17a3040fd27"' }>
                                        <li class="link">
                                            <a href="injectables/RecommendationsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RecommendationsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/RetryModule.html" data-type="entity-link" >RetryModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-RetryModule-b5bec6cd89a5a1c531413f2692cfa4473926c9a5f86fef5b699b2e1adccd4391846639bde3a35b7d15599f8e7b50fa01ea7acf68a5a6ba625373f51e4109c429"' : 'data-bs-target="#xs-injectables-links-module-RetryModule-b5bec6cd89a5a1c531413f2692cfa4473926c9a5f86fef5b699b2e1adccd4391846639bde3a35b7d15599f8e7b50fa01ea7acf68a5a6ba625373f51e4109c429"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-RetryModule-b5bec6cd89a5a1c531413f2692cfa4473926c9a5f86fef5b699b2e1adccd4391846639bde3a35b7d15599f8e7b50fa01ea7acf68a5a6ba625373f51e4109c429"' :
                                        'id="xs-injectables-links-module-RetryModule-b5bec6cd89a5a1c531413f2692cfa4473926c9a5f86fef5b699b2e1adccd4391846639bde3a35b7d15599f8e7b50fa01ea7acf68a5a6ba625373f51e4109c429"' }>
                                        <li class="link">
                                            <a href="injectables/RetryService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RetryService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/RoomQueueModule.html" data-type="entity-link" >RoomQueueModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-RoomQueueModule-8d3c6b6ada9ce73894d7dc3766365a27a402d67fe510d3683257f0996b42dc81f02ca71aad3efafa516175ce116f6df027eb42358b9c31c94a52a2ebc63cb855"' : 'data-bs-target="#xs-injectables-links-module-RoomQueueModule-8d3c6b6ada9ce73894d7dc3766365a27a402d67fe510d3683257f0996b42dc81f02ca71aad3efafa516175ce116f6df027eb42358b9c31c94a52a2ebc63cb855"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-RoomQueueModule-8d3c6b6ada9ce73894d7dc3766365a27a402d67fe510d3683257f0996b42dc81f02ca71aad3efafa516175ce116f6df027eb42358b9c31c94a52a2ebc63cb855"' :
                                        'id="xs-injectables-links-module-RoomQueueModule-8d3c6b6ada9ce73894d7dc3766365a27a402d67fe510d3683257f0996b42dc81f02ca71aad3efafa516175ce116f6df027eb42358b9c31c94a52a2ebc63cb855"' }>
                                        <li class="link">
                                            <a href="injectables/RoomQueueService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RoomQueueService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/RoomsModule.html" data-type="entity-link" >RoomsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-RoomsModule-a65feb40247181cf935053e6dfe2e0b96210cefce6207303ec6823e4ec1c9a9c12acbd62e6e14f5251b321974848f0f68449e9f34a9e27cfc6f0aa21346111f0"' : 'data-bs-target="#xs-controllers-links-module-RoomsModule-a65feb40247181cf935053e6dfe2e0b96210cefce6207303ec6823e4ec1c9a9c12acbd62e6e14f5251b321974848f0f68449e9f34a9e27cfc6f0aa21346111f0"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-RoomsModule-a65feb40247181cf935053e6dfe2e0b96210cefce6207303ec6823e4ec1c9a9c12acbd62e6e14f5251b321974848f0f68449e9f34a9e27cfc6f0aa21346111f0"' :
                                            'id="xs-controllers-links-module-RoomsModule-a65feb40247181cf935053e6dfe2e0b96210cefce6207303ec6823e4ec1c9a9c12acbd62e6e14f5251b321974848f0f68449e9f34a9e27cfc6f0aa21346111f0"' }>
                                            <li class="link">
                                                <a href="controllers/RoomsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RoomsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-RoomsModule-a65feb40247181cf935053e6dfe2e0b96210cefce6207303ec6823e4ec1c9a9c12acbd62e6e14f5251b321974848f0f68449e9f34a9e27cfc6f0aa21346111f0"' : 'data-bs-target="#xs-injectables-links-module-RoomsModule-a65feb40247181cf935053e6dfe2e0b96210cefce6207303ec6823e4ec1c9a9c12acbd62e6e14f5251b321974848f0f68449e9f34a9e27cfc6f0aa21346111f0"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-RoomsModule-a65feb40247181cf935053e6dfe2e0b96210cefce6207303ec6823e4ec1c9a9c12acbd62e6e14f5251b321974848f0f68449e9f34a9e27cfc6f0aa21346111f0"' :
                                        'id="xs-injectables-links-module-RoomsModule-a65feb40247181cf935053e6dfe2e0b96210cefce6207303ec6823e4ec1c9a9c12acbd62e6e14f5251b321974848f0f68449e9f34a9e27cfc6f0aa21346111f0"' }>
                                        <li class="link">
                                            <a href="injectables/RoomAnalyticsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RoomAnalyticsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/RoomsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RoomsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/RoomUsersModule.html" data-type="entity-link" >RoomUsersModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-RoomUsersModule-24924f0e22239870be8dd267e2d3bc6fb7a4d56fe38296973bd4bafe2fcd5dd13904306d6bf740d586c35fed1f60114850361eece0f4cce8280207c976b94c9a"' : 'data-bs-target="#xs-injectables-links-module-RoomUsersModule-24924f0e22239870be8dd267e2d3bc6fb7a4d56fe38296973bd4bafe2fcd5dd13904306d6bf740d586c35fed1f60114850361eece0f4cce8280207c976b94c9a"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-RoomUsersModule-24924f0e22239870be8dd267e2d3bc6fb7a4d56fe38296973bd4bafe2fcd5dd13904306d6bf740d586c35fed1f60114850361eece0f4cce8280207c976b94c9a"' :
                                        'id="xs-injectables-links-module-RoomUsersModule-24924f0e22239870be8dd267e2d3bc6fb7a4d56fe38296973bd4bafe2fcd5dd13904306d6bf740d586c35fed1f60114850361eece0f4cce8280207c976b94c9a"' }>
                                        <li class="link">
                                            <a href="injectables/RoomUsersService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RoomUsersService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/S3Module.html" data-type="entity-link" >S3Module</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-S3Module-9354e36f6ba8c4cdda0ee94934ce5a289ed1fb9ccb0aa62ba113b69b5911279949c2fd6d1880c92143eba80144fffcb1b35e36776a0b802fbd6eda6be9cf5654"' : 'data-bs-target="#xs-injectables-links-module-S3Module-9354e36f6ba8c4cdda0ee94934ce5a289ed1fb9ccb0aa62ba113b69b5911279949c2fd6d1880c92143eba80144fffcb1b35e36776a0b802fbd6eda6be9cf5654"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-S3Module-9354e36f6ba8c4cdda0ee94934ce5a289ed1fb9ccb0aa62ba113b69b5911279949c2fd6d1880c92143eba80144fffcb1b35e36776a0b802fbd6eda6be9cf5654"' :
                                        'id="xs-injectables-links-module-S3Module-9354e36f6ba8c4cdda0ee94934ce5a289ed1fb9ccb0aa62ba113b69b5911279949c2fd6d1880c92143eba80144fffcb1b35e36776a0b802fbd6eda6be9cf5654"' }>
                                        <li class="link">
                                            <a href="injectables/S3Service.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >S3Service</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/SearchModule.html" data-type="entity-link" >SearchModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-SearchModule-df2ab1698286656c7709ce46afd350dd5e3707b01a20223cec9ff27ef86546a950a6694e3c5ee5140105246cdd0ea58586473ab9ac3428d2cd5f76f470680cea"' : 'data-bs-target="#xs-controllers-links-module-SearchModule-df2ab1698286656c7709ce46afd350dd5e3707b01a20223cec9ff27ef86546a950a6694e3c5ee5140105246cdd0ea58586473ab9ac3428d2cd5f76f470680cea"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-SearchModule-df2ab1698286656c7709ce46afd350dd5e3707b01a20223cec9ff27ef86546a950a6694e3c5ee5140105246cdd0ea58586473ab9ac3428d2cd5f76f470680cea"' :
                                            'id="xs-controllers-links-module-SearchModule-df2ab1698286656c7709ce46afd350dd5e3707b01a20223cec9ff27ef86546a950a6694e3c5ee5140105246cdd0ea58586473ab9ac3428d2cd5f76f470680cea"' }>
                                            <li class="link">
                                                <a href="controllers/SearchController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SearchController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-SearchModule-df2ab1698286656c7709ce46afd350dd5e3707b01a20223cec9ff27ef86546a950a6694e3c5ee5140105246cdd0ea58586473ab9ac3428d2cd5f76f470680cea"' : 'data-bs-target="#xs-injectables-links-module-SearchModule-df2ab1698286656c7709ce46afd350dd5e3707b01a20223cec9ff27ef86546a950a6694e3c5ee5140105246cdd0ea58586473ab9ac3428d2cd5f76f470680cea"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-SearchModule-df2ab1698286656c7709ce46afd350dd5e3707b01a20223cec9ff27ef86546a950a6694e3c5ee5140105246cdd0ea58586473ab9ac3428d2cd5f76f470680cea"' :
                                        'id="xs-injectables-links-module-SearchModule-df2ab1698286656c7709ce46afd350dd5e3707b01a20223cec9ff27ef86546a950a6694e3c5ee5140105246cdd0ea58586473ab9ac3428d2cd5f76f470680cea"' }>
                                        <li class="link">
                                            <a href="injectables/SearchService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SearchService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/SongsModule.html" data-type="entity-link" >SongsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-SongsModule-dfbf88c2319b7f3d1989f9d5afaa035bec3a06f0119d22762a1c34c8941bf03860b89424d93f0a45c15e2e960fc144a2b6c8e545fc6dd4e7bb377dbfc8884207"' : 'data-bs-target="#xs-controllers-links-module-SongsModule-dfbf88c2319b7f3d1989f9d5afaa035bec3a06f0119d22762a1c34c8941bf03860b89424d93f0a45c15e2e960fc144a2b6c8e545fc6dd4e7bb377dbfc8884207"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-SongsModule-dfbf88c2319b7f3d1989f9d5afaa035bec3a06f0119d22762a1c34c8941bf03860b89424d93f0a45c15e2e960fc144a2b6c8e545fc6dd4e7bb377dbfc8884207"' :
                                            'id="xs-controllers-links-module-SongsModule-dfbf88c2319b7f3d1989f9d5afaa035bec3a06f0119d22762a1c34c8941bf03860b89424d93f0a45c15e2e960fc144a2b6c8e545fc6dd4e7bb377dbfc8884207"' }>
                                            <li class="link">
                                                <a href="controllers/SongsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SongsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-SongsModule-dfbf88c2319b7f3d1989f9d5afaa035bec3a06f0119d22762a1c34c8941bf03860b89424d93f0a45c15e2e960fc144a2b6c8e545fc6dd4e7bb377dbfc8884207"' : 'data-bs-target="#xs-injectables-links-module-SongsModule-dfbf88c2319b7f3d1989f9d5afaa035bec3a06f0119d22762a1c34c8941bf03860b89424d93f0a45c15e2e960fc144a2b6c8e545fc6dd4e7bb377dbfc8884207"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-SongsModule-dfbf88c2319b7f3d1989f9d5afaa035bec3a06f0119d22762a1c34c8941bf03860b89424d93f0a45c15e2e960fc144a2b6c8e545fc6dd4e7bb377dbfc8884207"' :
                                        'id="xs-injectables-links-module-SongsModule-dfbf88c2319b7f3d1989f9d5afaa035bec3a06f0119d22762a1c34c8941bf03860b89424d93f0a45c15e2e960fc144a2b6c8e545fc6dd4e7bb377dbfc8884207"' }>
                                        <li class="link">
                                            <a href="injectables/SongsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SongsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/SpotifyAuthModule.html" data-type="entity-link" >SpotifyAuthModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-SpotifyAuthModule-fb2fd141f2d731f2dc12dfdc7195bd674b8ba416afc32866fefdea66ad4a6539a5c0687467578a09ca68e9e79f64146cfb610a6e43d7dbc2d54de66a8da721c1"' : 'data-bs-target="#xs-injectables-links-module-SpotifyAuthModule-fb2fd141f2d731f2dc12dfdc7195bd674b8ba416afc32866fefdea66ad4a6539a5c0687467578a09ca68e9e79f64146cfb610a6e43d7dbc2d54de66a8da721c1"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-SpotifyAuthModule-fb2fd141f2d731f2dc12dfdc7195bd674b8ba416afc32866fefdea66ad4a6539a5c0687467578a09ca68e9e79f64146cfb610a6e43d7dbc2d54de66a8da721c1"' :
                                        'id="xs-injectables-links-module-SpotifyAuthModule-fb2fd141f2d731f2dc12dfdc7195bd674b8ba416afc32866fefdea66ad4a6539a5c0687467578a09ca68e9e79f64146cfb610a6e43d7dbc2d54de66a8da721c1"' }>
                                        <li class="link">
                                            <a href="injectables/SpotifyAuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SpotifyAuthService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/SpotifyModule.html" data-type="entity-link" >SpotifyModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-SpotifyModule-4f5ef3ce6063c9c7bd29fb19bdfb3e2ae4707d73fec8235deb032c3cc357254cc252340275e3128cece8b30eda7ee3ae50019679c58235468f61f91285f659bb"' : 'data-bs-target="#xs-injectables-links-module-SpotifyModule-4f5ef3ce6063c9c7bd29fb19bdfb3e2ae4707d73fec8235deb032c3cc357254cc252340275e3128cece8b30eda7ee3ae50019679c58235468f61f91285f659bb"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-SpotifyModule-4f5ef3ce6063c9c7bd29fb19bdfb3e2ae4707d73fec8235deb032c3cc357254cc252340275e3128cece8b30eda7ee3ae50019679c58235468f61f91285f659bb"' :
                                        'id="xs-injectables-links-module-SpotifyModule-4f5ef3ce6063c9c7bd29fb19bdfb3e2ae4707d73fec8235deb032c3cc357254cc252340275e3128cece8b30eda7ee3ae50019679c58235468f61f91285f659bb"' }>
                                        <li class="link">
                                            <a href="injectables/SpotifyService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SpotifyService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/TasksModule.html" data-type="entity-link" >TasksModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-TasksModule-7ede51244ec329dce21fc92c9d21bcba447d0e91284f9952279e1287fa19b175aa7c0a83dd2359f2f21b53c1e11ac4b7114dd908bffd9d8f190e5a07e6c1d6c4"' : 'data-bs-target="#xs-injectables-links-module-TasksModule-7ede51244ec329dce21fc92c9d21bcba447d0e91284f9952279e1287fa19b175aa7c0a83dd2359f2f21b53c1e11ac4b7114dd908bffd9d8f190e5a07e6c1d6c4"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-TasksModule-7ede51244ec329dce21fc92c9d21bcba447d0e91284f9952279e1287fa19b175aa7c0a83dd2359f2f21b53c1e11ac4b7114dd908bffd9d8f190e5a07e6c1d6c4"' :
                                        'id="xs-injectables-links-module-TasksModule-7ede51244ec329dce21fc92c9d21bcba447d0e91284f9952279e1287fa19b175aa7c0a83dd2359f2f21b53c1e11ac4b7114dd908bffd9d8f190e5a07e6c1d6c4"' }>
                                        <li class="link">
                                            <a href="injectables/TasksService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TasksService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UsersModule.html" data-type="entity-link" >UsersModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-UsersModule-2b3818067c994f3c2541a39f60be108c9d4dda285cdefeca9b43f840be8c6e495c9dc2543937c8cad7c69b774c401aa6ccb9193e7de1119ac62364a75f545306"' : 'data-bs-target="#xs-controllers-links-module-UsersModule-2b3818067c994f3c2541a39f60be108c9d4dda285cdefeca9b43f840be8c6e495c9dc2543937c8cad7c69b774c401aa6ccb9193e7de1119ac62364a75f545306"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-UsersModule-2b3818067c994f3c2541a39f60be108c9d4dda285cdefeca9b43f840be8c6e495c9dc2543937c8cad7c69b774c401aa6ccb9193e7de1119ac62364a75f545306"' :
                                            'id="xs-controllers-links-module-UsersModule-2b3818067c994f3c2541a39f60be108c9d4dda285cdefeca9b43f840be8c6e495c9dc2543937c8cad7c69b774c401aa6ccb9193e7de1119ac62364a75f545306"' }>
                                            <li class="link">
                                                <a href="controllers/UsersController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-UsersModule-2b3818067c994f3c2541a39f60be108c9d4dda285cdefeca9b43f840be8c6e495c9dc2543937c8cad7c69b774c401aa6ccb9193e7de1119ac62364a75f545306"' : 'data-bs-target="#xs-injectables-links-module-UsersModule-2b3818067c994f3c2541a39f60be108c9d4dda285cdefeca9b43f840be8c6e495c9dc2543937c8cad7c69b774c401aa6ccb9193e7de1119ac62364a75f545306"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UsersModule-2b3818067c994f3c2541a39f60be108c9d4dda285cdefeca9b43f840be8c6e495c9dc2543937c8cad7c69b774c401aa6ccb9193e7de1119ac62364a75f545306"' :
                                        'id="xs-injectables-links-module-UsersModule-2b3818067c994f3c2541a39f60be108c9d4dda285cdefeca9b43f840be8c6e495c9dc2543937c8cad7c69b774c401aa6ccb9193e7de1119ac62364a75f545306"' }>
                                        <li class="link">
                                            <a href="injectables/UsersService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/ActiveRoom.html" data-type="entity-link" >ActiveRoom</a>
                            </li>
                            <li class="link">
                                <a href="classes/AllTimeSessionDataDto.html" data-type="entity-link" >AllTimeSessionDataDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ChatEventDto.html" data-type="entity-link" >ChatEventDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CombinedSearchHistory.html" data-type="entity-link" >CombinedSearchHistory</a>
                            </li>
                            <li class="link">
                                <a href="classes/CombinedSearchResults.html" data-type="entity-link" >CombinedSearchResults</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateRoomDto.html" data-type="entity-link" >CreateRoomDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateUserDto.html" data-type="entity-link" >CreateUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateUserDto-1.html" data-type="entity-link" >CreateUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/DirectMessageDto.html" data-type="entity-link" >DirectMessageDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/EmojiReactionDto.html" data-type="entity-link" >EmojiReactionDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/FollowersAndFollowing.html" data-type="entity-link" >FollowersAndFollowing</a>
                            </li>
                            <li class="link">
                                <a href="classes/GenresWithCount.html" data-type="entity-link" >GenresWithCount</a>
                            </li>
                            <li class="link">
                                <a href="classes/InternalError.html" data-type="entity-link" >InternalError</a>
                            </li>
                            <li class="link">
                                <a href="classes/JoinsCount.html" data-type="entity-link" >JoinsCount</a>
                            </li>
                            <li class="link">
                                <a href="classes/JoinsPerDay.html" data-type="entity-link" >JoinsPerDay</a>
                            </li>
                            <li class="link">
                                <a href="classes/LinksWithCount.html" data-type="entity-link" >LinksWithCount</a>
                            </li>
                            <li class="link">
                                <a href="classes/LiveChatMessageDto.html" data-type="entity-link" >LiveChatMessageDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/LiveGateway.html" data-type="entity-link" >LiveGateway</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoginBody.html" data-type="entity-link" >LoginBody</a>
                            </li>
                            <li class="link">
                                <a href="classes/MessagesPerHour.html" data-type="entity-link" >MessagesPerHour</a>
                            </li>
                            <li class="link">
                                <a href="classes/ParticipantsPerHourDto.html" data-type="entity-link" >ParticipantsPerHourDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PlaybackEventDto.html" data-type="entity-link" >PlaybackEventDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/QueueEventDto.html" data-type="entity-link" >QueueEventDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/RefreshBody.html" data-type="entity-link" >RefreshBody</a>
                            </li>
                            <li class="link">
                                <a href="classes/RegisterBody.html" data-type="entity-link" >RegisterBody</a>
                            </li>
                            <li class="link">
                                <a href="classes/RoomAnalyticsContributorsDto.html" data-type="entity-link" >RoomAnalyticsContributorsDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/RoomAnalyticsDto.html" data-type="entity-link" >RoomAnalyticsDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/RoomAnalyticsInteractionsDto.html" data-type="entity-link" >RoomAnalyticsInteractionsDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/RoomAnalyticsKeyMetricsDto.html" data-type="entity-link" >RoomAnalyticsKeyMetricsDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/RoomAnalyticsParticipationDto.html" data-type="entity-link" >RoomAnalyticsParticipationDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/RoomAnalyticsQueueDto.html" data-type="entity-link" >RoomAnalyticsQueueDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/RoomAnalyticsSongsDto.html" data-type="entity-link" >RoomAnalyticsSongsDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/RoomAnalyticsVotesDto.html" data-type="entity-link" >RoomAnalyticsVotesDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/RoomDto.html" data-type="entity-link" >RoomDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/RoomEntity.html" data-type="entity-link" >RoomEntity</a>
                            </li>
                            <li class="link">
                                <a href="classes/RoomsData.html" data-type="entity-link" >RoomsData</a>
                            </li>
                            <li class="link">
                                <a href="classes/RoomSong.html" data-type="entity-link" >RoomSong</a>
                            </li>
                            <li class="link">
                                <a href="classes/RoomSongDto.html" data-type="entity-link" >RoomSongDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SearchHistoryDto.html" data-type="entity-link" >SearchHistoryDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SessionDataPerDayDto.html" data-type="entity-link" >SessionDataPerDayDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SessionDurationPerDayDto.html" data-type="entity-link" >SessionDurationPerDayDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SongAnalyticsDto.html" data-type="entity-link" >SongAnalyticsDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SongInfoDto.html" data-type="entity-link" >SongInfoDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SongInfoEntity.html" data-type="entity-link" >SongInfoEntity</a>
                            </li>
                            <li class="link">
                                <a href="classes/SongInfosWithCount.html" data-type="entity-link" >SongInfosWithCount</a>
                            </li>
                            <li class="link">
                                <a href="classes/SpotifyCallbackResponse.html" data-type="entity-link" >SpotifyCallbackResponse</a>
                            </li>
                            <li class="link">
                                <a href="classes/SpotifyTokenPair.html" data-type="entity-link" >SpotifyTokenPair</a>
                            </li>
                            <li class="link">
                                <a href="classes/SpotifyTokenRefreshResponse.html" data-type="entity-link" >SpotifyTokenRefreshResponse</a>
                            </li>
                            <li class="link">
                                <a href="classes/SpotifyTokenResponse.html" data-type="entity-link" >SpotifyTokenResponse</a>
                            </li>
                            <li class="link">
                                <a href="classes/SpotifyUser.html" data-type="entity-link" >SpotifyUser</a>
                            </li>
                            <li class="link">
                                <a href="classes/TasksProcessor.html" data-type="entity-link" >TasksProcessor</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateRoomDto.html" data-type="entity-link" >UpdateRoomDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateUserDto.html" data-type="entity-link" >UpdateUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateUserDto-1.html" data-type="entity-link" >UpdateUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateUserDto-2.html" data-type="entity-link" >UpdateUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateUserProfileDto.html" data-type="entity-link" >UpdateUserProfileDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserActionDto.html" data-type="entity-link" >UserActionDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserDto.html" data-type="entity-link" >UserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserEntity.html" data-type="entity-link" >UserEntity</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserError.html" data-type="entity-link" >UserError</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserFriendship.html" data-type="entity-link" >UserFriendship</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserListeningStatsDto.html" data-type="entity-link" >UserListeningStatsDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserProfileDto.html" data-type="entity-link" >UserProfileDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/VoteDto.html" data-type="entity-link" >VoteDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/WsExceptionFilter.html" data-type="entity-link" >WsExceptionFilter</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/JwtAuthGuard.html" data-type="entity-link" >JwtAuthGuard</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/Category.html" data-type="entity-link" >Category</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/dmUser.html" data-type="entity-link" >dmUser</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Emoji.html" data-type="entity-link" >Emoji</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/liveChatUser.html" data-type="entity-link" >liveChatUser</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});