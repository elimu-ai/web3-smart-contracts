// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

interface ILanguages {
    function addSupportedLanguage(string calldata languageCode) external;
    function removeSupportedLanguage(string calldata languageCode) external;
    function isSupportedLanguage(string calldata languageCode) external view returns (bool);
}
