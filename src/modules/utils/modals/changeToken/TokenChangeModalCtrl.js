(function () {
    'use strict';

    /**
     * @param Base
     * @param {$rootScope.Scope} $scope
     * @param createPoll
     * @param {app.utils} utils
     * @param {Waves} waves
     * @param {User} user
     * @param {BalanceWatcher} balanceWatcher
     * @return {TokenChangeModalCtrl}
     */
    const controller = function (Base, $scope, createPoll, utils, waves, user, balanceWatcher) {

        const entities = require('@waves/data-entities');
        const { SIGN_TYPE } = require('@decentralchain/signature-adapter');

        const analytics = require('@waves/event-sender');
        const ds = require('data-service');

        class TokenChangeModalCtrl extends Base {

            /**
             * @type {args}
             */
            signPending = false;
            /**
             * @type {Array}
             * @private
             */
            _listeners = [];

            constructor({ money, txType }) {
                super($scope);
                /**
                 * @type {number}
                 */
                this.step = 0;
                /**
                 * @type {boolean}
                 */
                this.noFee = false;
                /**
                 * @type {'burn'|'reissue'}
                 */
                this.txType = txType;
                /**
                 * @type {ExtendedAsset}
                 */
                this.asset = money.asset;
                /**
                 * @type {boolean}
                 */
                this.issue = money.asset.reissuable;
                /**
                 * @type {BigNumber}
                 */
                this.maxCoinsCount = WavesApp.maxCoinsCount.sub(money.asset.quantity);
                /**
                 * @type {Money}
                 */
                this.balance = money;
                /**
                 * @type {Money}
                 */
                this.precision = money.asset.precision;
                /**
                 * @type {Precision}
                 */
                this.input = null;
                /**
                 * @type {Money}
                 */
                this.quantity = new entities.Money(this.asset.quantity, this.asset);
                /**
                 * @type {Money}
                 * @private
                 */
                this._waves = null;

                const {
                    description
                } = utils.getDataFromOracles(money.asset);

                this.description = description || money.asset.description;

                const { TokenChangeModalCtrl = {} } = user.getThemeSettings();

                this.options = {
                    grid: {
                        x: false,
                        y: false
                    },
                    margin: {
                        top: 0,
                        right: 0,
                        left: 0,
                        bottom: 0
                    },
                    series: [
                        {
                            dataset: 'values',
                            key: 'rate',
                            label: 'Rate',
                            color: TokenChangeModalCtrl.seriesColor || '#ff8d00',
                            type: ['line', 'area']
                        }
                    ],
                    axes: {
                        x: {
                            key: 'timestamp',
                            type: 'date',
                            ticks: 4
                        }
                    }
                };

                const type = this.txType === 'burn' ? SIGN_TYPE.BURN : SIGN_TYPE.REISSUE;
                waves.node.getFee({ type, assetId: money.asset.id }).then((fee) => {
                    this.fee = fee;
                    $scope.$digest();
                });

                createPoll(this, this._getGraphData, 'chartData', 15000);
                ds.api.assets.get(WavesApp.defaultAssets.DCC).then(asset => {
                    this.receive(balanceWatcher.change, () => this._updateWavesBalance(asset));
                    this._updateWavesBalance(asset);
                });

                this.observe(['input', 'issue'], this._createTx);
                this.observe(['_waves', 'fee'], this._changeHasFee);

                const signPendingListener = $scope.$on('signPendingChange', (event, data) => {
                    this.signPending = data;
                });

                this._listeners.push(signPendingListener);
            }

            $onDestroy() {
                super.$onDestroy();
                this._listeners.forEach(listener => listener());
            }

            getSignable() {
                const name = this.txType.slice(0, 1).toUpperCase() + this.txType.slice(1);
                analytics.send({ name: `${name} Token Continue Click`, target: 'ui' });
                return this.signable;
            }

            next() {
                this.step++;
            }

            /**
             * @param {Asset} asset
             * @private
             */
            _updateWavesBalance(asset) {
                this._waves = balanceWatcher.getBalanceByAsset(asset);
                utils.safeApply($scope);
            }

            /**
             * @private
             */
            _changeHasFee() {
                if (!this._waves || !this.fee) {
                    return null;
                }

                this.noFee = this._waves.lt(this.fee);
            }

            /**
             * @private
             */
            _createTx() {
                const input = this.input;
                const type = this.txType === 'burn' ? SIGN_TYPE.BURN : SIGN_TYPE.REISSUE;
                const quantityField = this.txType === 'burn' ? 'amount' : 'quantity';


                if (input) {
                    const tx = waves.node.transactions.createTransaction({
                        type,
                        assetId: input.asset.id,
                        description: input.asset.description,
                        fee: this.fee,
                        [quantityField]: input,
                        precision: input.asset.precision,
                        reissuable: this.issue
                    });
                    this.signable = ds.signature.getSignatureApi().makeSignable({
                        type,
                        data: tx
                    });
                } else {
                    this.tx = null;
                    this.signable = null;
                }
            }

            /**
             * @return {Promise<{values: {rate: number, timestamp: Date}[]}>}
             * @private
             */
            _getGraphData() {
                const startDate = utils.moment().add().day(-100);
                return waves.utils.getRateHistory(this.asset.id, user.getSetting('baseAssetId'), startDate)
                    .then((values) => ({ values }));
            }

        }

        const { money, txType } = this;
        return new TokenChangeModalCtrl({ money, txType });
    };

    controller.$inject = ['Base', '$scope', 'createPoll', 'utils', 'waves', 'user', 'balanceWatcher'];

    angular.module('app.utils').controller('TokenChangeModalCtrl', controller);
})();
