(function () {
    'use strict';

    const controller = function (Base,
                                 user,
                                 $scope,
                                 RatingStarsFactory,
                                 $element,
                                 waves,
                                 modalManager,
                                 balanceWatcher,
                                 $mdDialog,
                                 utils) {

        const { SIGN_TYPE } = require('@decentralchain/signature-adapter');
        const CRC_ID = WavesApp.CRCAsset;
        const DCC_ID = WavesApp.defaultAssets.DCC;
        const NEED_CRC = 1;

        class RatingStars extends Base {

            /**
             * @type JQuery
             */
            $container;
            /**
             * @type boolean
             */
            hasBalance = false;
            /**
             * @type number
             */
            rating;
            /**
             * @type string
             */
            size;
            /**
             * @type string
             */
            assetID;
            /**
             * @type boolean
             */
            canRate = false;

            $postLink() {
                const ratingStars = new RatingStarsFactory({
                    $container: $element.find('.rating-stars-wrapper'),
                    rating: this.rating,
                    size: this.size,
                    canRate: this.canRate,
                    hasBalance: this.hasBalance
                });

                this.observe('rating', () => {
                    ratingStars.update(this.rating);
                });

                if (this.canRate) {
                    this.observe('hasBalance', () => {
                        ratingStars.updateStatus(this.hasBalance);
                        $scope.$apply();
                    });

                    waves.node.getFee({ type: SIGN_TYPE.DATA })
                        .then(money => {
                            this.fee = money;
                            this._checkBalance();
                            this.receive(ratingStars.vote, this._onVote, this);
                        });
                }

            }

            _checkBalance() {
                const balance = balanceWatcher.getBalance();
                this.wavesBalance = balance[DCC_ID];
                this.CRCBalance = balance[CRC_ID];
                if (this.wavesBalance.gte(this.fee) && this.CRCBalance && this.CRCBalance.getTokens().gte(NEED_CRC)) {
                    this.hasBalance = true;
                    $scope.$apply();
                }
            }

            _onVote(rating) {
                waves.node.getFee({ type: SIGN_TYPE.DATA })
                    .then(money => {
                        this.fee = money;

                        const tx = waves.node.transactions.createTransaction({
                            type: SIGN_TYPE.DATA,
                            data: {
                                data: [
                                    {
                                        key: 'tokenRating',
                                        type: 'string',
                                        value: 'tokenRating'
                                    }, {
                                        key: 'assetId',
                                        type: 'string',
                                        value: this.assetId
                                    }, {
                                        key: 'score',
                                        type: 'integer',
                                        value: rating
                                    }
                                ],
                                fee: this.fee,
                                type: SIGN_TYPE.DATA
                            }
                        });
                        this.signable = ds.signature.getSignatureApi().makeSignable(tx);

                        RatingStars._generateTx(this.signable);
                    });

            }

            static _generateTx(signable) {
                $mdDialog.hide();
                return modalManager.showConfirmTx(signable);
            }

            openDex() {
                utils.openDex(CRC_ID);
            }

        }

        return new RatingStars();
    };

    controller.$inject = [
        'Base',
        'user',
        '$scope',
        'RatingStarsFactory',
        '$element',
        'waves',
        'modalManager',
        'balanceWatcher',
        '$mdDialog',
        'utils'];

    angular.module('app.ui').component('wRatingStars', {
        bindings: {
            rating: '<',
            size: '<',
            canRate: '<',
            assetId: '<'
        },
        templateUrl: 'modules/ui/directives/ratingStars/ratingStars.html',
        controller
    });

})();
