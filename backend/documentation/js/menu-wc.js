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
                                            'data-bs-target="#controllers-links-module-AppModule-3781b7770827e081ff750c56f1da0e24fb175b2212ffdd25d675410f21fb0c08d8b1fdf2e061fdb39cd4e3a1dd8d81b573852fee0c2fc8e94747b88c19e10f3a"' : 'data-bs-target="#xs-controllers-links-module-AppModule-3781b7770827e081ff750c56f1da0e24fb175b2212ffdd25d675410f21fb0c08d8b1fdf2e061fdb39cd4e3a1dd8d81b573852fee0c2fc8e94747b88c19e10f3a"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AppModule-3781b7770827e081ff750c56f1da0e24fb175b2212ffdd25d675410f21fb0c08d8b1fdf2e061fdb39cd4e3a1dd8d81b573852fee0c2fc8e94747b88c19e10f3a"' :
                                            'id="xs-controllers-links-module-AppModule-3781b7770827e081ff750c56f1da0e24fb175b2212ffdd25d675410f21fb0c08d8b1fdf2e061fdb39cd4e3a1dd8d81b573852fee0c2fc8e94747b88c19e10f3a"' }>
                                            <li class="link">
                                                <a href="controllers/AppController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AppModule-3781b7770827e081ff750c56f1da0e24fb175b2212ffdd25d675410f21fb0c08d8b1fdf2e061fdb39cd4e3a1dd8d81b573852fee0c2fc8e94747b88c19e10f3a"' : 'data-bs-target="#xs-injectables-links-module-AppModule-3781b7770827e081ff750c56f1da0e24fb175b2212ffdd25d675410f21fb0c08d8b1fdf2e061fdb39cd4e3a1dd8d81b573852fee0c2fc8e94747b88c19e10f3a"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-3781b7770827e081ff750c56f1da0e24fb175b2212ffdd25d675410f21fb0c08d8b1fdf2e061fdb39cd4e3a1dd8d81b573852fee0c2fc8e94747b88c19e10f3a"' :
                                        'id="xs-injectables-links-module-AppModule-3781b7770827e081ff750c56f1da0e24fb175b2212ffdd25d675410f21fb0c08d8b1fdf2e061fdb39cd4e3a1dd8d81b573852fee0c2fc8e94747b88c19e10f3a"' }>
                                        <li class="link">
                                            <a href="injectables/AppService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/DbUtilsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DbUtilsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/DtoGenService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DtoGenService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuthModule.html" data-type="entity-link" >AuthModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AuthModule-cd09e4f72ff34d99d3f1c5e6896c10c3aee7ae63b26c9587571ac355d5689cb0db29260b8456425836e3a744ed2b4951dc478b045a087762a53774018ae9ae48"' : 'data-bs-target="#xs-controllers-links-module-AuthModule-cd09e4f72ff34d99d3f1c5e6896c10c3aee7ae63b26c9587571ac355d5689cb0db29260b8456425836e3a744ed2b4951dc478b045a087762a53774018ae9ae48"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AuthModule-cd09e4f72ff34d99d3f1c5e6896c10c3aee7ae63b26c9587571ac355d5689cb0db29260b8456425836e3a744ed2b4951dc478b045a087762a53774018ae9ae48"' :
                                            'id="xs-controllers-links-module-AuthModule-cd09e4f72ff34d99d3f1c5e6896c10c3aee7ae63b26c9587571ac355d5689cb0db29260b8456425836e3a744ed2b4951dc478b045a087762a53774018ae9ae48"' }>
                                            <li class="link">
                                                <a href="controllers/AuthController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AuthModule-cd09e4f72ff34d99d3f1c5e6896c10c3aee7ae63b26c9587571ac355d5689cb0db29260b8456425836e3a744ed2b4951dc478b045a087762a53774018ae9ae48"' : 'data-bs-target="#xs-injectables-links-module-AuthModule-cd09e4f72ff34d99d3f1c5e6896c10c3aee7ae63b26c9587571ac355d5689cb0db29260b8456425836e3a744ed2b4951dc478b045a087762a53774018ae9ae48"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthModule-cd09e4f72ff34d99d3f1c5e6896c10c3aee7ae63b26c9587571ac355d5689cb0db29260b8456425836e3a744ed2b4951dc478b045a087762a53774018ae9ae48"' :
                                        'id="xs-injectables-links-module-AuthModule-cd09e4f72ff34d99d3f1c5e6896c10c3aee7ae63b26c9587571ac355d5689cb0db29260b8456425836e3a744ed2b4951dc478b045a087762a53774018ae9ae48"' }>
                                        <li class="link">
                                            <a href="injectables/AuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/JwtStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JwtStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/LocalStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LocalStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/PrismaService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PrismaService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/DbUtilsModule.html" data-type="entity-link" >DbUtilsModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-DbUtilsModule-2fb33c8d5323ab5b51d9948ce6d5a2d63f74216a74461451843ee60c1a04e938758c923e6f2ed571bf9241e6fd858be34b3e4a3a02d2ab46d5fd59bda80ca053"' : 'data-bs-target="#xs-injectables-links-module-DbUtilsModule-2fb33c8d5323ab5b51d9948ce6d5a2d63f74216a74461451843ee60c1a04e938758c923e6f2ed571bf9241e6fd858be34b3e4a3a02d2ab46d5fd59bda80ca053"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-DbUtilsModule-2fb33c8d5323ab5b51d9948ce6d5a2d63f74216a74461451843ee60c1a04e938758c923e6f2ed571bf9241e6fd858be34b3e4a3a02d2ab46d5fd59bda80ca053"' :
                                        'id="xs-injectables-links-module-DbUtilsModule-2fb33c8d5323ab5b51d9948ce6d5a2d63f74216a74461451843ee60c1a04e938758c923e6f2ed571bf9241e6fd858be34b3e4a3a02d2ab46d5fd59bda80ca053"' }>
                                        <li class="link">
                                            <a href="injectables/DbUtilsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DbUtilsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/PrismaService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PrismaService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/DtoGenModule.html" data-type="entity-link" >DtoGenModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-DtoGenModule-9dbb19eb69b3a9cac9b2017e38a0370ad05affc86b04d4adf6b3c1506c25a8861b092d2e6baf127b80bd8a7816f9cebd502aab1edc798666021f7989b1521642"' : 'data-bs-target="#xs-injectables-links-module-DtoGenModule-9dbb19eb69b3a9cac9b2017e38a0370ad05affc86b04d4adf6b3c1506c25a8861b092d2e6baf127b80bd8a7816f9cebd502aab1edc798666021f7989b1521642"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-DtoGenModule-9dbb19eb69b3a9cac9b2017e38a0370ad05affc86b04d4adf6b3c1506c25a8861b092d2e6baf127b80bd8a7816f9cebd502aab1edc798666021f7989b1521642"' :
                                        'id="xs-injectables-links-module-DtoGenModule-9dbb19eb69b3a9cac9b2017e38a0370ad05affc86b04d4adf6b3c1506c25a8861b092d2e6baf127b80bd8a7816f9cebd502aab1edc798666021f7989b1521642"' }>
                                        <li class="link">
                                            <a href="injectables/DbUtilsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DbUtilsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/DtoGenService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DtoGenService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/PrismaService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PrismaService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/PrismaModule.html" data-type="entity-link" >PrismaModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-PrismaModule-3725815baa04a8e9365b93433d071a5019a2328b655e4db8f688cf4f3e030398af91b01c2553b8bef465a101a06b7aab70129524c160b2d73afca175b8b4ad62"' : 'data-bs-target="#xs-injectables-links-module-PrismaModule-3725815baa04a8e9365b93433d071a5019a2328b655e4db8f688cf4f3e030398af91b01c2553b8bef465a101a06b7aab70129524c160b2d73afca175b8b4ad62"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-PrismaModule-3725815baa04a8e9365b93433d071a5019a2328b655e4db8f688cf4f3e030398af91b01c2553b8bef465a101a06b7aab70129524c160b2d73afca175b8b4ad62"' :
                                        'id="xs-injectables-links-module-PrismaModule-3725815baa04a8e9365b93433d071a5019a2328b655e4db8f688cf4f3e030398af91b01c2553b8bef465a101a06b7aab70129524c160b2d73afca175b8b4ad62"' }>
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
                                            'data-bs-target="#controllers-links-module-ProfileModule-0fc9ea21da071a2791cb986874f79f1f869928d00b72fe29b9f6224776196ec961afb1dde03ec5356283fa90030749a9c47bce928932c27082493d549e7a48dc"' : 'data-bs-target="#xs-controllers-links-module-ProfileModule-0fc9ea21da071a2791cb986874f79f1f869928d00b72fe29b9f6224776196ec961afb1dde03ec5356283fa90030749a9c47bce928932c27082493d549e7a48dc"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ProfileModule-0fc9ea21da071a2791cb986874f79f1f869928d00b72fe29b9f6224776196ec961afb1dde03ec5356283fa90030749a9c47bce928932c27082493d549e7a48dc"' :
                                            'id="xs-controllers-links-module-ProfileModule-0fc9ea21da071a2791cb986874f79f1f869928d00b72fe29b9f6224776196ec961afb1dde03ec5356283fa90030749a9c47bce928932c27082493d549e7a48dc"' }>
                                            <li class="link">
                                                <a href="controllers/ProfileController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProfileController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ProfileModule-0fc9ea21da071a2791cb986874f79f1f869928d00b72fe29b9f6224776196ec961afb1dde03ec5356283fa90030749a9c47bce928932c27082493d549e7a48dc"' : 'data-bs-target="#xs-injectables-links-module-ProfileModule-0fc9ea21da071a2791cb986874f79f1f869928d00b72fe29b9f6224776196ec961afb1dde03ec5356283fa90030749a9c47bce928932c27082493d549e7a48dc"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ProfileModule-0fc9ea21da071a2791cb986874f79f1f869928d00b72fe29b9f6224776196ec961afb1dde03ec5356283fa90030749a9c47bce928932c27082493d549e7a48dc"' :
                                        'id="xs-injectables-links-module-ProfileModule-0fc9ea21da071a2791cb986874f79f1f869928d00b72fe29b9f6224776196ec961afb1dde03ec5356283fa90030749a9c47bce928932c27082493d549e7a48dc"' }>
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
                                <a href="modules/RoomsModule.html" data-type="entity-link" >RoomsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-RoomsModule-6c85d5b3082de7e8ea00d7f55c6a80688d21818ebf86ed979551f9a19ca9e03e08085acf9cf9f5d9aa556a8229dbaf5a71c3a266b99a63789b902c574b48786b"' : 'data-bs-target="#xs-controllers-links-module-RoomsModule-6c85d5b3082de7e8ea00d7f55c6a80688d21818ebf86ed979551f9a19ca9e03e08085acf9cf9f5d9aa556a8229dbaf5a71c3a266b99a63789b902c574b48786b"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-RoomsModule-6c85d5b3082de7e8ea00d7f55c6a80688d21818ebf86ed979551f9a19ca9e03e08085acf9cf9f5d9aa556a8229dbaf5a71c3a266b99a63789b902c574b48786b"' :
                                            'id="xs-controllers-links-module-RoomsModule-6c85d5b3082de7e8ea00d7f55c6a80688d21818ebf86ed979551f9a19ca9e03e08085acf9cf9f5d9aa556a8229dbaf5a71c3a266b99a63789b902c574b48786b"' }>
                                            <li class="link">
                                                <a href="controllers/RoomsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RoomsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-RoomsModule-6c85d5b3082de7e8ea00d7f55c6a80688d21818ebf86ed979551f9a19ca9e03e08085acf9cf9f5d9aa556a8229dbaf5a71c3a266b99a63789b902c574b48786b"' : 'data-bs-target="#xs-injectables-links-module-RoomsModule-6c85d5b3082de7e8ea00d7f55c6a80688d21818ebf86ed979551f9a19ca9e03e08085acf9cf9f5d9aa556a8229dbaf5a71c3a266b99a63789b902c574b48786b"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-RoomsModule-6c85d5b3082de7e8ea00d7f55c6a80688d21818ebf86ed979551f9a19ca9e03e08085acf9cf9f5d9aa556a8229dbaf5a71c3a266b99a63789b902c574b48786b"' :
                                        'id="xs-injectables-links-module-RoomsModule-6c85d5b3082de7e8ea00d7f55c6a80688d21818ebf86ed979551f9a19ca9e03e08085acf9cf9f5d9aa556a8229dbaf5a71c3a266b99a63789b902c574b48786b"' }>
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
                                            <a href="injectables/RoomsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RoomsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UsersModule.html" data-type="entity-link" >UsersModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-UsersModule-94bb1fa097245257aa8e203829de2fcbb98487dcfdcbea2b53190612bee13759192bb8fe5a4b510c59d598e7f6788efbaf48135e40e28d8820442f72e9bb43d3"' : 'data-bs-target="#xs-controllers-links-module-UsersModule-94bb1fa097245257aa8e203829de2fcbb98487dcfdcbea2b53190612bee13759192bb8fe5a4b510c59d598e7f6788efbaf48135e40e28d8820442f72e9bb43d3"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-UsersModule-94bb1fa097245257aa8e203829de2fcbb98487dcfdcbea2b53190612bee13759192bb8fe5a4b510c59d598e7f6788efbaf48135e40e28d8820442f72e9bb43d3"' :
                                            'id="xs-controllers-links-module-UsersModule-94bb1fa097245257aa8e203829de2fcbb98487dcfdcbea2b53190612bee13759192bb8fe5a4b510c59d598e7f6788efbaf48135e40e28d8820442f72e9bb43d3"' }>
                                            <li class="link">
                                                <a href="controllers/UsersController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-UsersModule-94bb1fa097245257aa8e203829de2fcbb98487dcfdcbea2b53190612bee13759192bb8fe5a4b510c59d598e7f6788efbaf48135e40e28d8820442f72e9bb43d3"' : 'data-bs-target="#xs-injectables-links-module-UsersModule-94bb1fa097245257aa8e203829de2fcbb98487dcfdcbea2b53190612bee13759192bb8fe5a4b510c59d598e7f6788efbaf48135e40e28d8820442f72e9bb43d3"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UsersModule-94bb1fa097245257aa8e203829de2fcbb98487dcfdcbea2b53190612bee13759192bb8fe5a4b510c59d598e7f6788efbaf48135e40e28d8820442f72e9bb43d3"' :
                                        'id="xs-injectables-links-module-UsersModule-94bb1fa097245257aa8e203829de2fcbb98487dcfdcbea2b53190612bee13759192bb8fe5a4b510c59d598e7f6788efbaf48135e40e28d8820442f72e9bb43d3"' }>
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
                                <a href="classes/AuthBody.html" data-type="entity-link" >AuthBody</a>
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
                                <a href="classes/RoomDto.html" data-type="entity-link" >RoomDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/RoomEntity.html" data-type="entity-link" >RoomEntity</a>
                            </li>
                            <li class="link">
                                <a href="classes/SongInfoDto.html" data-type="entity-link" >SongInfoDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SongInfoEntity.html" data-type="entity-link" >SongInfoEntity</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateRoomDto.html" data-type="entity-link" >UpdateRoomDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateUserDto.html" data-type="entity-link" >UpdateUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateUserProfileDto.html" data-type="entity-link" >UpdateUserProfileDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserDto.html" data-type="entity-link" >UserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserEntity.html" data-type="entity-link" >UserEntity</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserProfileDto.html" data-type="entity-link" >UserProfileDto</a>
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