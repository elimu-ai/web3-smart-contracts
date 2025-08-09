// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

interface ILanguages {
    function getSupportedLanguages() external view returns (string[] calldata languageCodes);
    function isSupportedLanguage(string calldata languageCode) external view returns (bool);
}
