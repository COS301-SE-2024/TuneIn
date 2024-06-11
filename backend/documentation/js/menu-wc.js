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
                                            'data-bs-target="#controllers-links-module-AuthModule-c4399fd2949afdaab12e339defa69c068b30ea3a77550a1d72da7c409436fe46108457723f46d44cc5d163aaa5c49d5e3d7e083ea0ae8bc243c7a68bbf9a214e"' : 'data-bs-target="#xs-controllers-links-module-AuthModule-c4399fd2949afdaab12e339defa69c068b30ea3a77550a1d72da7c409436fe46108457723f46d44cc5d163aaa5c49d5e3d7e083ea0ae8bc243c7a68bbf9a214e"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AuthModule-c4399fd2949afdaab12e339defa69c068b30ea3a77550a1d72da7c409436fe46108457723f46d44cc5d163aaa5c49d5e3d7e083ea0ae8bc243c7a68bbf9a214e"' :
                                            'id="xs-controllers-links-module-AuthModule-c4399fd2949afdaab12e339defa69c068b30ea3a77550a1d72da7c409436fe46108457723f46d44cc5d163aaa5c49d5e3d7e083ea0ae8bc243c7a68bbf9a214e"' }>
                                            <li class="link">
                                                <a href="controllers/AuthController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AuthModule-c4399fd2949afdaab12e339defa69c068b30ea3a77550a1d72da7c409436fe46108457723f46d44cc5d163aaa5c49d5e3d7e083ea0ae8bc243c7a68bbf9a214e"' : 'data-bs-target="#xs-injectables-links-module-AuthModule-c4399fd2949afdaab12e339defa69c068b30ea3a77550a1d72da7c409436fe46108457723f46d44cc5d163aaa5c49d5e3d7e083ea0ae8bc243c7a68bbf9a214e"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthModule-c4399fd2949afdaab12e339defa69c068b30ea3a77550a1d72da7c409436fe46108457723f46d44cc5d163aaa5c49d5e3d7e083ea0ae8bc243c7a68bbf9a214e"' :
                                        'id="xs-injectables-links-module-AuthModule-c4399fd2949afdaab12e339defa69c068b30ea3a77550a1d72da7c409436fe46108457723f46d44cc5d163aaa5c49d5e3d7e083ea0ae8bc243c7a68bbf9a214e"' }>
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
                                            <a href="injectables/JwtStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JwtStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/LocalStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LocalStrategy</a>
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
                            <li class="link">
                                <a href="modules/DbUtilsModule.html" data-type="entity-link" >DbUtilsModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-DbUtilsModule-7e0444ba0b06869fff40b6b4603c08875432dfb1648253af5f36d4ccb7c38e9393aaf588efcdd35bd3f26484b18845afe4ad2269fce676b626ed44832d722fa9"' : 'data-bs-target="#xs-injectables-links-module-DbUtilsModule-7e0444ba0b06869fff40b6b4603c08875432dfb1648253af5f36d4ccb7c38e9393aaf588efcdd35bd3f26484b18845afe4ad2269fce676b626ed44832d722fa9"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-DbUtilsModule-7e0444ba0b06869fff40b6b4603c08875432dfb1648253af5f36d4ccb7c38e9393aaf588efcdd35bd3f26484b18845afe4ad2269fce676b626ed44832d722fa9"' :
                                        'id="xs-injectables-links-module-DbUtilsModule-7e0444ba0b06869fff40b6b4603c08875432dfb1648253af5f36d4ccb7c38e9393aaf588efcdd35bd3f26484b18845afe4ad2269fce676b626ed44832d722fa9"' }>
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
                                        'data-bs-target="#injectables-links-module-DtoGenModule-e64c575cd42e6e99cfb42b5dc113e2ac90d46efe030ebf39ba50750baff05bfa2b84ceb5fa2b4f2ddb811e3fe146ececae4c524644ce22c4dbd9cbbeb7b65cdc"' : 'data-bs-target="#xs-injectables-links-module-DtoGenModule-e64c575cd42e6e99cfb42b5dc113e2ac90d46efe030ebf39ba50750baff05bfa2b84ceb5fa2b4f2ddb811e3fe146ececae4c524644ce22c4dbd9cbbeb7b65cdc"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-DtoGenModule-e64c575cd42e6e99cfb42b5dc113e2ac90d46efe030ebf39ba50750baff05bfa2b84ceb5fa2b4f2ddb811e3fe146ececae4c524644ce22c4dbd9cbbeb7b65cdc"' :
                                        'id="xs-injectables-links-module-DtoGenModule-e64c575cd42e6e99cfb42b5dc113e2ac90d46efe030ebf39ba50750baff05bfa2b84ceb5fa2b4f2ddb811e3fe146ececae4c524644ce22c4dbd9cbbeb7b65cdc"' }>
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
                                            'data-bs-target="#controllers-links-module-ProfileModule-3b923c0fe135013dc8b5dbf0f1d8dc70b394e4fcb0c9453c84e822665d3188b28389a6e38d02602d6476c4dd1f68be6afdd551a70949f739d26b84b20c320c76"' : 'data-bs-target="#xs-controllers-links-module-ProfileModule-3b923c0fe135013dc8b5dbf0f1d8dc70b394e4fcb0c9453c84e822665d3188b28389a6e38d02602d6476c4dd1f68be6afdd551a70949f739d26b84b20c320c76"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ProfileModule-3b923c0fe135013dc8b5dbf0f1d8dc70b394e4fcb0c9453c84e822665d3188b28389a6e38d02602d6476c4dd1f68be6afdd551a70949f739d26b84b20c320c76"' :
                                            'id="xs-controllers-links-module-ProfileModule-3b923c0fe135013dc8b5dbf0f1d8dc70b394e4fcb0c9453c84e822665d3188b28389a6e38d02602d6476c4dd1f68be6afdd551a70949f739d26b84b20c320c76"' }>
                                            <li class="link">
                                                <a href="controllers/ProfileController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProfileController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ProfileModule-3b923c0fe135013dc8b5dbf0f1d8dc70b394e4fcb0c9453c84e822665d3188b28389a6e38d02602d6476c4dd1f68be6afdd551a70949f739d26b84b20c320c76"' : 'data-bs-target="#xs-injectables-links-module-ProfileModule-3b923c0fe135013dc8b5dbf0f1d8dc70b394e4fcb0c9453c84e822665d3188b28389a6e38d02602d6476c4dd1f68be6afdd551a70949f739d26b84b20c320c76"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ProfileModule-3b923c0fe135013dc8b5dbf0f1d8dc70b394e4fcb0c9453c84e822665d3188b28389a6e38d02602d6476c4dd1f68be6afdd551a70949f739d26b84b20c320c76"' :
                                        'id="xs-injectables-links-module-ProfileModule-3b923c0fe135013dc8b5dbf0f1d8dc70b394e4fcb0c9453c84e822665d3188b28389a6e38d02602d6476c4dd1f68be6afdd551a70949f739d26b84b20c320c76"' }>
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
                                <a href="modules/RoomsModule.html" data-type="entity-link" >RoomsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-RoomsModule-2c5d8a4a5611104f865027936e0c0e49a1f09b56bea9ab065786f7c763f8cf3013edb823912eb9340f19628a4a634466c2f474e24dd71c14403433da2e3ec3db"' : 'data-bs-target="#xs-controllers-links-module-RoomsModule-2c5d8a4a5611104f865027936e0c0e49a1f09b56bea9ab065786f7c763f8cf3013edb823912eb9340f19628a4a634466c2f474e24dd71c14403433da2e3ec3db"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-RoomsModule-2c5d8a4a5611104f865027936e0c0e49a1f09b56bea9ab065786f7c763f8cf3013edb823912eb9340f19628a4a634466c2f474e24dd71c14403433da2e3ec3db"' :
                                            'id="xs-controllers-links-module-RoomsModule-2c5d8a4a5611104f865027936e0c0e49a1f09b56bea9ab065786f7c763f8cf3013edb823912eb9340f19628a4a634466c2f474e24dd71c14403433da2e3ec3db"' }>
                                            <li class="link">
                                                <a href="controllers/RoomsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RoomsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-RoomsModule-2c5d8a4a5611104f865027936e0c0e49a1f09b56bea9ab065786f7c763f8cf3013edb823912eb9340f19628a4a634466c2f474e24dd71c14403433da2e3ec3db"' : 'data-bs-target="#xs-injectables-links-module-RoomsModule-2c5d8a4a5611104f865027936e0c0e49a1f09b56bea9ab065786f7c763f8cf3013edb823912eb9340f19628a4a634466c2f474e24dd71c14403433da2e3ec3db"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-RoomsModule-2c5d8a4a5611104f865027936e0c0e49a1f09b56bea9ab065786f7c763f8cf3013edb823912eb9340f19628a4a634466c2f474e24dd71c14403433da2e3ec3db"' :
                                        'id="xs-injectables-links-module-RoomsModule-2c5d8a4a5611104f865027936e0c0e49a1f09b56bea9ab065786f7c763f8cf3013edb823912eb9340f19628a4a634466c2f474e24dd71c14403433da2e3ec3db"' }>
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
                                            <a href="injectables/RoomsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RoomsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UsersModule.html" data-type="entity-link" >UsersModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-UsersModule-c7ddd5440ec0d39ec052207635f356dc349ff179630fc84aef5662b115dfc42ee619ee1020fa011263954342cbe8f84b9063294368c651868bae83b60b8b55a8"' : 'data-bs-target="#xs-controllers-links-module-UsersModule-c7ddd5440ec0d39ec052207635f356dc349ff179630fc84aef5662b115dfc42ee619ee1020fa011263954342cbe8f84b9063294368c651868bae83b60b8b55a8"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-UsersModule-c7ddd5440ec0d39ec052207635f356dc349ff179630fc84aef5662b115dfc42ee619ee1020fa011263954342cbe8f84b9063294368c651868bae83b60b8b55a8"' :
                                            'id="xs-controllers-links-module-UsersModule-c7ddd5440ec0d39ec052207635f356dc349ff179630fc84aef5662b115dfc42ee619ee1020fa011263954342cbe8f84b9063294368c651868bae83b60b8b55a8"' }>
                                            <li class="link">
                                                <a href="controllers/UsersController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-UsersModule-c7ddd5440ec0d39ec052207635f356dc349ff179630fc84aef5662b115dfc42ee619ee1020fa011263954342cbe8f84b9063294368c651868bae83b60b8b55a8"' : 'data-bs-target="#xs-injectables-links-module-UsersModule-c7ddd5440ec0d39ec052207635f356dc349ff179630fc84aef5662b115dfc42ee619ee1020fa011263954342cbe8f84b9063294368c651868bae83b60b8b55a8"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UsersModule-c7ddd5440ec0d39ec052207635f356dc349ff179630fc84aef5662b115dfc42ee619ee1020fa011263954342cbe8f84b9063294368c651868bae83b60b8b55a8"' :
                                        'id="xs-injectables-links-module-UsersModule-c7ddd5440ec0d39ec052207635f356dc349ff179630fc84aef5662b115dfc42ee619ee1020fa011263954342cbe8f84b9063294368c651868bae83b60b8b55a8"' }>
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
                                <a href="classes/CreateRoomDto.html" data-type="entity-link" >CreateRoomDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateUserDto.html" data-type="entity-link" >CreateUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateUserDto-1.html" data-type="entity-link" >CreateUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoginBody.html" data-type="entity-link" >LoginBody</a>
                            </li>
                            <li class="link">
                                <a href="classes/RegisterBody.html" data-type="entity-link" >RegisterBody</a>
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