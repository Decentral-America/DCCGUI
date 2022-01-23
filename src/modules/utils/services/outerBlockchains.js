(function () {
    'use strict';

    const factory = function () {
        return Object.keys(WavesApp.network.wavesGateway).reduce((result, key) => {
            result[key] = {
                isValidAddress(string) {
                    return new RegExp(WavesApp.network.wavesGateway[key].regex).test(string);
                }
            };
            return result;
        }, Object.create(null));
    };

    factory.$inject = [
        'waves'
    ];

    angular.module('app.utils').factory('outerBlockchains', factory);
})();

/**
 * @typedef {function} IIsValidAddress
 * @param {string} address
 * @return {boolean}
 */

/**
 * @typedef {Object.<string, IIsValidAddress>} IOuterBlockchains
 */
