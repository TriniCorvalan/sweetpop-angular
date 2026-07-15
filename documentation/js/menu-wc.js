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
                    <a href="index.html" data-type="index-link">sweetpop-angular documentation</a>
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
                                    <span class="icon ion-ios-paper"></span>
                                        README
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
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/App.html" data-type="entity-link" >App</a>
                            </li>
                            <li class="link">
                                <a href="components/Bars.html" data-type="entity-link" >Bars</a>
                            </li>
                            <li class="link">
                                <a href="components/BoxCatalogCards.html" data-type="entity-link" >BoxCatalogCards</a>
                            </li>
                            <li class="link">
                                <a href="components/BoxDraftBar.html" data-type="entity-link" >BoxDraftBar</a>
                            </li>
                            <li class="link">
                                <a href="components/Boxes.html" data-type="entity-link" >Boxes</a>
                            </li>
                            <li class="link">
                                <a href="components/Candies.html" data-type="entity-link" >Candies</a>
                            </li>
                            <li class="link">
                                <a href="components/Cart.html" data-type="entity-link" >Cart</a>
                            </li>
                            <li class="link">
                                <a href="components/CategoryCatalogCards.html" data-type="entity-link" >CategoryCatalogCards</a>
                            </li>
                            <li class="link">
                                <a href="components/CategoryProducts.html" data-type="entity-link" >CategoryProducts</a>
                            </li>
                            <li class="link">
                                <a href="components/Chocolates.html" data-type="entity-link" >Chocolates</a>
                            </li>
                            <li class="link">
                                <a href="components/Customers.html" data-type="entity-link" >Customers</a>
                            </li>
                            <li class="link">
                                <a href="components/Footer.html" data-type="entity-link" >Footer</a>
                            </li>
                            <li class="link">
                                <a href="components/Gummies.html" data-type="entity-link" >Gummies</a>
                            </li>
                            <li class="link">
                                <a href="components/HardCandies.html" data-type="entity-link" >HardCandies</a>
                            </li>
                            <li class="link">
                                <a href="components/Header.html" data-type="entity-link" >Header</a>
                            </li>
                            <li class="link">
                                <a href="components/Home.html" data-type="entity-link" >Home</a>
                            </li>
                            <li class="link">
                                <a href="components/Inventory.html" data-type="entity-link" >Inventory</a>
                            </li>
                            <li class="link">
                                <a href="components/InventoryForm.html" data-type="entity-link" >InventoryForm</a>
                            </li>
                            <li class="link">
                                <a href="components/Login.html" data-type="entity-link" >Login</a>
                            </li>
                            <li class="link">
                                <a href="components/Logout.html" data-type="entity-link" >Logout</a>
                            </li>
                            <li class="link">
                                <a href="components/NavLinks.html" data-type="entity-link" >NavLinks</a>
                            </li>
                            <li class="link">
                                <a href="components/Profile.html" data-type="entity-link" >Profile</a>
                            </li>
                            <li class="link">
                                <a href="components/RecoverPassword.html" data-type="entity-link" >RecoverPassword</a>
                            </li>
                            <li class="link">
                                <a href="components/Register.html" data-type="entity-link" >Register</a>
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
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BoxDraftService.html" data-type="entity-link" >BoxDraftService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CartService.html" data-type="entity-link" >CartService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CatalogService.html" data-type="entity-link" >CatalogService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/InventoryService.html" data-type="entity-link" >InventoryService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StorageService.html" data-type="entity-link" >StorageService</a>
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
                                <a href="interfaces/Box.html" data-type="entity-link" >Box</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BoxDraft.html" data-type="entity-link" >BoxDraft</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BoxWallAssignment.html" data-type="entity-link" >BoxWallAssignment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Candy.html" data-type="entity-link" >Candy</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CartItem.html" data-type="entity-link" >CartItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Category.html" data-type="entity-link" >Category</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CurrentUser.html" data-type="entity-link" >CurrentUser</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/InventoryItem.html" data-type="entity-link" >InventoryItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LoginResult.html" data-type="entity-link" >LoginResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ServiceResult.html" data-type="entity-link" >ServiceResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Session.html" data-type="entity-link" >Session</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/User.html" data-type="entity-link" >User</a>
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
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
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