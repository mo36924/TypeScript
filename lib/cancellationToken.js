/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */


"use strict";
const fs = require("fs");
function pipeExists(name) {
    return fs.existsSync(name);
}
function createCancellationToken(args) {
    let cancellationPipeName;
    for (let i = 0; i < args.length - 1; i++) {
        if (args[i] === "--cancellationPipeName") {
            cancellationPipeName = args[i + 1];
            break;
        }
    }
    if (!cancellationPipeName) {
        return {
            isCancellationRequested: () => false,
            setRequest: (_requestId) => void 0,
            resetRequest: (_requestId) => void 0
        };
    }
    if (cancellationPipeName.charAt(cancellationPipeName.length - 1) === "*") {
        const namePrefix = cancellationPipeName.slice(0, -1);
        if (namePrefix.length === 0 || namePrefix.indexOf("*") >= 0) {
            throw new Error("Invalid name for template cancellation pipe: it should have length greater than 2 characters and contain only one '*'.");
        }
        let perRequestPipeName;
        let currentRequestId;
        return {
            isCancellationRequested: () => perRequestPipeName !== undefined && pipeExists(perRequestPipeName),
            setRequest(requestId) {
                currentRequestId = requestId;
                perRequestPipeName = namePrefix + requestId;
            },
            resetRequest(requestId) {
                if (currentRequestId !== requestId) {
                    throw new Error(`Mismatched request id, expected ${currentRequestId}, actual ${requestId}`);
                }
                perRequestPipeName = undefined;
            }
        };
    }
    else {
        return {
            isCancellationRequested: () => pipeExists(cancellationPipeName),
            setRequest: (_requestId) => void 0,
            resetRequest: (_requestId) => void 0
        };
    }
}
module.exports = createCancellationToken;
//# sourceMappingURL=cancellationToken.js.map