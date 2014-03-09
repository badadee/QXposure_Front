function BRAPPapprovalController($scope, $dialog, $q, BRAPPapprovalContext, BRAPPapprovalEntity, $location) {
    function InitScope() {
        $scope.contextLoadFailed = false;
        $scope.hideApproved = true;
        $scope.isDataLoading = true;
        $scope.changeGroups = [];
        $scope.changeGroupTBDList = [];
        $scope.changeGroupPendingList = [];
        $scope.changeGroupList = [];
        $scope.selectedChangeGroup = "";
        $scope.selectedChangeGroupHeader = false;
        $scope.lookUpTable = [];
    }

    $scope.load = function () {
        InitScope();
        loadBRAPPApproval();
    };

    function determineStatus(entity, changeGroup) {
        return (changeGroup.Status == "B") ? "B" : (entity.Status);
    }

    $scope.searchChangeGroup = function (searchText, isPending) {
        searchList = (isPending ? $scope.changeGroupPendingList : $scope.changGroupTBDList);
        searchTextLength = searchText.length;
        searchListLength = searchList.length;
        for (var index = 0; index < searchListLength; index++) {
            

        }

    }

    function loadBRAPPApproval() {
        $scope.startTime = new Date();
        LoadBRAPPapprovalContext()
        .then(function (data) {
            $scope.oneAtATime = false;
            $scope.isDataLoading = false;
            $scope.changeGroupList = [];
            var index = 0;
            var ENTITY_TYPE_LEGALENTITIES = 0;
            var ENTITY_TYPE_OBLIGATIONS = 1;
            var ENTITY_TYPE_RATINGACTIONS = 2;
            var ENTITY_TYPE_COMPANYPEERS = 3;
            var ENTITY_TYPE_COMPANYLINKS = 4;

            for (index; index < data.length; ++index) {
                var entity = data[index];
                var changeGroupName = entity.ChangeGroup;
                $scope.changeGroupList.push(changeGroupName);
                if ($scope.changeGroups[changeGroupName] == undefined) {
                    $scope.changeGroups[changeGroupName] = [];
                    $scope.changeGroups[changeGroupName].Status = "N"; //init CG status to pending
                    $scope.changeGroups[changeGroupName].legalEntities = [];
                    $scope.changeGroups[changeGroupName].obligations = [];
                    $scope.changeGroups[changeGroupName].companyLinks = [];
                    $scope.changeGroups[changeGroupName].companyPeers = [];
                    $scope.changeGroups[changeGroupName].ratingActions = [];
                   

                    //just push into the right list if changeGroup is just created
                    switch (entity.EntityType) {
                        case ENTITY_TYPE_LEGALENTITIES:
                            $scope.lookUpTable.push({ id: entity.ChangeId, changeGroupName: changeGroupName, index:
                                $scope.changeGroups[changeGroupName].legalEntities.push(entity)
                            });
                            break;
                        case ENTITY_TYPE_OBLIGATIONS:
                            $scope.lookUpTable.push({ id: entity.ChangeId, changeGroupName: changeGroupName, index:
                                $scope.changeGroups[changeGroupName].obligations.push(entity)
                            });
                            break;
                        case ENTITY_TYPE_RATINGACTIONS:
                            $scope.lookUpTable.push({ id: entity.ChangeId, changeGroupName: changeGroupName, index:
                                $scope.changeGroups[changeGroupName].ratingActions.push(entity)
                            });
                            break;
                        case ENTITY_TYPE_COMPANYPEERS:
                            $scope.lookUpTable.push({ id: entity.ChangeId, changeGroupName: changeGroupName, index:
                                $scope.changeGroups[changeGroupName].companyPeers.push(entity)
                            });
                            break;
                        case ENTITY_TYPE_COMPANYLINKS:
                            $scope.lookUpTable.push({ id: entity.ChangeId, changeGroupName: changeGroupName, index:
                                $scope.changeGroups[changeGroupName].companyLinks.push(entity)
                            });
                            break;
                    }
                } else {
                    //got to replace the existing entity if changeGroup and/or entity already exists
                    //but find the entry (if possible) in the lookup table 
                    var listFinder = _.findWhere($scope.lookUpTable, { id: entity.ChangeId });
                    var changeGroupName = entity.ChangeGroup;
                    switch (entity.EntityType) {
                        case ENTITY_TYPE_LEGALENTITIES:
                            if (listFinder != undefined) {
                                $scope.changeGroups[changeGroupName].legalEntities[listFinder.index - 1] = entity;
                            } else {
                                $scope.lookUpTable.push({ id: entity.ChangeId, changeGroupName: changeGroupName, index:
                                $scope.changeGroups[changeGroupName].legalEntities.push(entity)
                                });
                            }
                            break;
                        case ENTITY_TYPE_OBLIGATIONS:
                            if (listFinder != undefined) {
                                $scope.changeGroups[changeGroupName].obligations[listFinder.index - 1] = entity;
                            } else {
                                $scope.lookUpTable.push({ id: entity.ChangeId, changeGroupName: changeGroupName, index:
                                $scope.changeGroups[changeGroupName].obligations.push(entity)
                                });
                            }
                            break;
                        case ENTITY_TYPE_RATINGACTIONS:
                            if (listFinder != undefined) {
                                $scope.changeGroups[changeGroupName].ratingActions[listFinder.index - 1] = entity;
                            } else {
                                $scope.lookUpTable.push({ id: entity.ChangeId, changeGroupName: changeGroupName, index:
                                $scope.changeGroups[changeGroupName].ratingActions.push(entity)
                                });
                            }
                            break;
                        case ENTITY_TYPE_COMPANYPEERS:
                            if (listFinder != undefined) {
                                $scope.changeGroups[changeGroupName].companyPeers[listFinder.index - 1] = entity;
                            } else {
                                $scope.lookUpTable.push({ id: entity.ChangeId, changeGroupName: changeGroupName, index:
                                $scope.changeGroups[changeGroupName].companyPeers.push(entity)
                                });
                            }
                            break;
                        case ENTITY_TYPE_COMPANYLINKS:
                            if (listFinder != undefined) {
                                $scope.changeGroups[changeGroupName].companyPeers[listFinder.index - 1] = entity;
                            } else {
                                $scope.lookUpTable.push({ id: entity.ChangeId, changeGroupName: changeGroupName, index:
                                $scope.changeGroups[changeGroupName].companyLinks.push(entity)
                                });
                            }
                            break;
                    }
                }
                //TODO: TEST THIS!
                $scope.changeGroups[changeGroupName].Status =
                    determineStatus(entity, $scope.changeGroups[changeGroupName]);
            }
            $scope.changeGroupList = $scope.changeGroupList.sort();
            index = 0;
            $scope.changeGroupPendingList = [];
            $scope.changeGroupTBDList = [];
            for (index; index < $scope.changeGroupList.length; ++index) {
                var name = $scope.changeGroupList[index];
                var group = $scope.changeGroups[name];
                //push to different output lists
                //TODO: TEST THIS!
                if ((group.Status == "N" || group.Status == "F")
                    && (!_.contains($scope.changeGroupPendingList, name))) {
                    $scope.changeGroupPendingList.push(name);
                } else if ((group.Status == "B")
                && (!_.contains($scope.changeGroupTBDList, name))) {
                    $scope.changeGroupTBDList.push(name);
                }

                //getting session data for client expanded accordions    
                //TODO: TEST THIS!            
                if (sessionStorage.getItem(name) == "true") {
                    $scope.changeGroups[name].clientAccordionOpen = true;
                } else {
                    $scope.changeGroups[name].clientAccordionOpen = false;
                }
            }
        });
    }

    $scope.setSessionStorage = function (changeGroup) {
        if (typeof (Storage) !== "undefined") {
            if ($scope.changeGroups[changeGroup].clientAccordionOpen) {
                sessionStorage.setItem(changeGroup, "");
            } else {
                sessionStorage.setItem(changeGroup, "true");
            }
        }
        var end4 = new Date();
        console.log("op5: " + (end4.getTime() - $scope.startTime.getTime()));
    }
    //helper function to return a changeGroup list based on type
    function getChangeGroupType(changeGroup, type) {
        var changeGroupList = [];
        if (type == "obligations") {
            changeGroupList = changeGroup.obligations;
        } else if (type == "ratingActions") {
            changeGroupList = changeGroup.ratingActions;
        } else if (type == "legalEntities") {
            changeGroupList = changeGroup.legalEntities;
        } else if (type == "companyLinks") {
            changeGroupList = changeGroup.companyLinks;
        } else if (type == "companyPeers") {
            changeGroupList = changeGroup.companyPeers;
        }
        return changeGroupList;
    }

    $scope.openModal = function (obj, type, hasItemListExt) {
        //        $scope.objExt = objExt;
        $scope.hasItemListExt = hasItemListExt;
        $scope.type = type;

        LoadBRAPPapprovalEntity(obj.ChangeId, obj.EntityType).
        then(function (data) {
            $scope.objExt = data;

            var legalApproval = false;
            if ($scope.objExt) {
                //conditions to determine approval dependencies
                if (type == "legalEntities") {
                    legalApproval = true;
                } else if (type == "ratingActions") {
                    if ($scope.changeGroups[obj.ChangeGroup].legalEntities.length == 0 && $scope.changeGroups[obj.ChangeGroup].obligations.length == 0) {
                        legalApproval = true;
                    }
                } else if (type == "obligations" || type == "companyLinks" || type == "companyPeers") {
                    if ($scope.changeGroups[obj.ChangeGroup].legalEntities.length == 0) {
                        legalApproval = true;
                    }
                }

                var d = $dialog.dialog({
                    backdrop: true,
                    keyboard: true,
                    backdropClick: true,
                    dialogFade: false,
                    backdropFade: false,
                    templateUrl: '/content/static/BRAPPapproval/BRAPPapprovalModal.html',
                    controller: 'DialogCtrl',
                    resolve: {
                        obj: function () {
                            return $scope.objExt;
                        },
                        hasItemList: function () {
                            return $scope.hasItemListExt;
                        },
                        type: function () {
                            return $scope.type;
                        },
                        legalApproval: function () {
                            return legalApproval;
                        }
                    }
                });
            } else {
                var d = $dialog.dialog({
                    backdrop: true,
                    keyboard: true,
                    backdropClick: true,
                    dialogFade: false,
                    backdropFade: false,
                    templateUrl: '/content/static/BRAPPapproval/ErrorModal.html',
                    controller: 'DialogCtrl',
                    resolve: {
                        obj: function () {
                            return $scope.objExt;
                        },
                        hasItemList: function () {
                            return $scope.hasItemListExt;
                        },
                        type: function () {
                            return $scope.type;
                        },
                        legalApproval: function () {
                            return legalApproval;
                        }
                    }
                });
            }

            d.open()
        .then(function (opts) { if (opts) { refreshBRAPPApproval(opts) } });
        });
    }

    $scope.refreshButton = function () {
        refreshBRAPPApproval([{ waitRefresh: false}]);
    }

    $scope.selectChangeGroup = function (tempChangeGroup) {
        $scope.selectedChangeGroup = tempChangeGroup;
        var changeGroup = $scope.changeGroups[tempChangeGroup];
        if (changeGroup.legalEntities.length > 0) {
            $scope.selectedTransactionHeader = "Companies";
        } else if (changeGroup.companyLinks.length > 0) {
            $scope.selectedTransactionHeader = "Links";
        } else if (changeGroup.obligations.length > 0) {
            $scope.selectedTransactionHeader = "Debts";
        } else if (changeGroup.ratingActions.length > 0) {
            $scope.selectedTransactionHeader = "Ratings";
        } else if (changeGroup.companyPeers.length > 0) {
            $scope.selectedTransactionHeader = "Peers";
        } else {
            $scope.selectedTransactionHeader = "";
        }
    }

    $scope.selectTransactionHeader = function (header) {
        $scope.selectedTransactionHeader = header;
    }

    $scope.checkSelectedChangeGroup = function (changeGroup) {
        if ($scope.selectedChangeGroup == changeGroup) {
            return true;
        } else {
            return false;
        }
    }

    $scope.checkSelectedTransactionHeader = function (header) {
        if ($scope.selectedTransactionHeader == header) {
            return true;
        } else {
            return false;
        }
    }

    $scope.logTime = function () {

        var end4 = new Date();
        console.log("op7: " + (end4.getTime() - $scope.startTime.getTime()));
        $scope.startTime = new Date();
    }
    function refreshBRAPPApproval(o) {
        if (o[0].waitRefresh) {
            $scope.isDataLoading = false;
            window.setTimeout(function () { loadBRAPPApproval() }, 2500);
            //$scope.ChangeGroup["2013 Popolare Bari SME S.r.l."].legalEntities[0].ChangedByFriendlyName = "testest123";
            var a = true;
        } else {
            $scope.isDataLoading = false;
            loadBRAPPApproval();
        }
        if (o[1]) {
            $scope.dependencyError = o[2].tempChangeId;
        } else {
            $scope.dependencyError = -1;
        }
    }

    $scope.checkLastApprove = function (entity) {
        if ($scope.dependencyError) {
            return ($scope.dependencyError == entity.ChangeId)


        }

    }

    function LoadBRAPPapprovalContext() {
        var deferred = $q.defer();
        var startTime = new Date();
        BRAPPapprovalContext.query({}, function (rsp) {
            if (rsp.ok === false) {
                deferred.reject(rsp.Message || '');
                return;
            }
            var end2 = new Date();
            console.log("opLOADBRAPP_API_RESOLVE: " + (end2.getTime() - startTime.getTime()));
            deferred.resolve(rsp);
        }, function (rsp) {
            deferred.reject('');
        });



        var end = new Date();
        console.log("opLOADBRAPP_API: " + (end.getTime() - startTime.getTime()));
        return deferred.promise;
    }
    function LoadBRAPPapprovalEntity(changeId, entityType) {
        var deferred = $q.defer();

        BRAPPapprovalEntity.query({ id: changeId, entityType: entityType }, function (rsp) {
            if (rsp.ok === false) {
                deferred.reject(rsp.Message || '');
                return;
            }
            deferred.resolve(rsp);
        }, function (rsp) {
            deferred.reject('');
        });

        return deferred.promise;
    }
}

function DialogCtrl($scope, $q, $rootScope, $http, dialog, obj, command, hasItemList, type, legalApproval) {
    $scope.friendlyNameMap = {
        'LegalName': 'Name',
        'CountryFriendlyName': 'Country of Domicile',
        'AssetClassFriendlyName': 'Industry',
        'DBRSCompanyFriendlyName': 'Region of Interest',
        'LeadAnalystFriendlyName': 'Lead Analyst',
        'BackupAnalyst': 'Backup Analyst',
        'CreateDate': 'Date Created',
        'UpdateDate': 'Date Updated',
        'GovernmentBackingFriendlyName': 'Backed By Government',
        'IsIssuerRating': 'Issuer Rating',
        'IssuanceDate': 'Closing Date',
        'ObligationAbbreviatedName': 'Abbreviation',
        'ObligationName': 'Debt Name',
        'ObligationRankTypeFriendlyName': 'Debt Rank Type',
        'ObligationSecurityTypeFriendlyName': 'Debt Security Type',
        'ObligationTypeFriendlyName': 'Debt Type',
        'CommitteeDate': 'Committee Date',
        'CreatedBy': 'Created By',
        'DiscontinuedReason': 'Discountinued Reason',
        'FinalResponseDate': 'Final Response Date',
        'IsEuEndorsed': 'EU Endorsed',
        'IsPublicRating': 'Public Rating',
        'IsSolicited': 'Solicited',
        'IssuerNotifyDate': 'Issuer Notify Date',
        'RatingStatus': 'Rating Status',
        'ReportedDate': 'Reported Date',
        'UnderReviewReason': 'Under Review Reason',
        'LinkText': 'Link Text',
        'LinkUrl': 'Link URL',
        'UpdatedBy': 'Updated By',
        'Notes': 'Internal Notes',
        'ShortName': 'Bloomberg/Short Name',
        'SearchToken': 'Alias',
        'BICCode': 'BIC Code'
    };

    $scope.disallowMap = { //what you put in the value field doesn't matter in this map
        'Acknowledged': 1,
        'ChangeId': 1,
        'ChangeDate': 1,
        'ChangeGroup': 1,
        'ChangeType': 1,
        '$$hashKey': 1,
        'LegalEntityId': 1,
        'PublishId': 1,
        'CountryId': 1,
        'AssetClassId': 'Asset Class ID',
        'DBRSCompanyId': 'DBRS Company ID',
        'GovernmentBackingId': 'Government Backing ID',
        'ObligationDataId': 'Obligation Data ID',
        'ObligationRankTypeId': 'Obligation Rank Type ID',
        'ObligationSecurityTypeId': 'Obligation Security Type ID',
        'ObligationTypeId': 'Obligation Type ID',
        'ObligationId': 'Obligation ID',
        'RatingActionId': 'Rating Action ID',
        'RatingId': 'Rating ID',
        'modBy': 1,
        'modDate': 1,
        'LastError': 1,
        'Status': 1,
        'Note': 1
        //'BackupAnalyst': 1,
        //'LeadAnalyst': 1
    };
    $scope.legalEntityHardSortMap = {
        'Name': 0,
        'Bloomberg/Short Name': 1,
        'Alias': 2,
        'Industry': 3,
        'Country of Domicile': 4,
        'Region of Interest': 5,
        'Summary': 6,
        'Internal Notes': 7,
        'BIC Code': 8,
        'Lead Analyst': 9,
        'Date Created': 10,
        'Date Updated': 11
    };
    $scope.obligationHardSortMap = {
        'Debt Type': 0,
        'Debt Security Type': 1,
        'Debt Rank Type': 2,
        'Debt Name': 3,
        'Abbreviation': 4,
        'Backed By Government': 5,
        'Closing Date': 6,
        'Issuer Rating': 7,
        'Internal Notes': 8
    };
    $scope.type = type;
    $scope.obj = obj;
    $scope.discussionNotes = obj.Note;

    //building brapp links here
    //+++++++++++++++++++++++++++++++++
    if (type == "legalEntities") {
        $scope.brappUri = brappUri + "/servlet/CompanyPage?companyId=" + obj.PublishId;
    } else if (type == "obligations") {
        $scope.brappUri = brappUri + "/servlet/DebtEdit?debtId=" + obj.PublishId;
    } else if (type == "ratingActions") {
        $scope.brappUri = brappUri + "/servlet/RatingEdit?ratingId=" + obj.PublishId;
    } else if (type == "companyPeers") {
        $scope.brappUri = brappUri + "/servlet/CompanyIndustryPeerListPage?companyId=" + obj.PublishId;
    } else if (type == "companyLinks") {
        $scope.brappUri = brappUri + "/servlet/CompanyUrlListPage?companyId=" + obj.PublishId;
    }

    //+++++++++++++++++++++++++++++++++
    if (!hasItemList) {
        $scope.outputList = buildInfoList($scope.obj);
    } else {
        $scope.outputItemList = buildInfoItemList($scope.obj);
    }
    $scope.hasAnalystList = false;
    $scope.hasItems = hasItemList;
    $scope.approve = function () {
        if (legalApproval) {
            ExecuteApproveCommand($scope.obj);
            dialog.close([{ waitRefresh: false}]);
        } else {
            dialog.close([{ waitRefresh: false }, { dependencyError: true }, { tempChangeId: $scope.obj.ChangeId}]);
        }
    };

    $scope.cancel = function () {
        dialog.close([{ waitRefresh: false}]);
    };

    $scope.toBeDiscussed = function () {
        ExecuteUpdateStatusCommand($scope.obj, "B", $scope.discussionNotes);
        dialog.close([{ waitRefresh: false}]);
    };
    $scope.moveToPendingList = function () {
        var tempObj = $scope.obj;
        var tempStatus = "";
        if (tempObj.LastError) {
            tempStatus = "F";
        } else {
            tempStatus = "N";
        }
        ExecuteUpdateStatusCommand($scope.obj, tempStatus, $scope.discussionNotes);
        dialog.close([{ waitRefresh: false}]);
    };
    function buildInfoItemList(obj) {
        var index = 0;
        var rtnList = [];
        for (index; index < obj.Items.length; index++) {
            rtnList.push(buildInfoList(obj.Items[index]));
        }
        return rtnList;
    }

    function buildInfoList(obj) {
        var keyValueList = [], name;
        for (name in obj) {
            if (obj.hasOwnProperty(name)) {
                if ($scope.disallowMap[name] == undefined) {
                    var friendlyName = $scope.friendlyNameMap[name];
                    var keyValueItem = {
                        key: ((friendlyName == undefined) ? name : friendlyName),
                        value: obj[name]
                    };
                    if (keyValueItem.key == 'Date Created' || keyValueItem.key == 'Date Updated'
                        || keyValueItem.key == 'Reported Date' || keyValueItem.key == 'Committee Date'
                        || keyValueItem.key == 'Closing Date') {
                        keyValueItem.value = (keyValueItem.value == undefined) ?
                            keyValueItem.value : keyValueItem.value.split("T")[0];
                    }
                    keyValueList.push(keyValueItem);
                }
                if (name == "AllAnalystList") {
                    $scope.allAnalystList = obj[name];
                    $scope.hasAnalystList = true;
                }
            }
        }
        if (type == 'obligations') {
            return hardSortObligation(keyValueList);
        } else if (type == 'legalEntities') {
            return hardSortLegalEntity(keyValueList);
        } else {
            return keyValueList;
        }
    }

    //hardcoding the order of the fields to match BRAPP

    function hardSortLegalEntity(array) {
        var LEGALENTITY_MAX_ARRAY_SIZE = 12;
        var rtnArray = new Array(LEGALENTITY_MAX_ARRAY_SIZE);
        for (var index = 0; index < array.length; index++) {
            rtnArray[$scope.legalEntityHardSortMap[array[index].key]] = array[index];
        }
        return rtnArray;
    }

    //hardcoding the order of the fields to match BRAPP
    function hardSortObligation(array) {
        var OBLIGATION_MAX_ARRAY_SIZE = 9;
        var rtnArray = new Array(OBLIGATION_MAX_ARRAY_SIZE);
        for (var index = 0; index < array.length; index++) {
            rtnArray[$scope.obligationHardSortMap[array[index].key]] = array[index];
        }
        return rtnArray;
    }

    function sortByKey(array, key) {
        return array.sort(function (a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }

    function ExecuteApproveCommand(entity) {
        var deferred = $q.defer();
        var payload = { Changes: [{
            ChangeId: entity.ChangeId,
            ChangeDate: entity.ChangeDate
        }]
        }

        command('publishing publish entity changes', payload, function (rsp) {
            // needs to be done this way since 
            // command is outside of angular
            if (rsp.ok === false) {
                $rootScope.$apply(deferred.reject(rsp.Message || ''));
                return;
            }
            $rootScope.$apply(deferred.resolve(rsp));
        }, function (rsp) {
            var msg = (rsp && rsp.Message) ? rsp.Message : 'unknown error';
            $rootScope.$apply(deferred.reject(msg));
        });

        return deferred.promise;
    }

    function ExecuteUpdateStatusCommand(entity, status, note) {
        var deferred = $q.defer();
        var payload = { ChangeId: entity.ChangeId,
            Status: status,
            Note: note
        };

        if (entity.LastError) {
            payload.LastError = entity.LastError;
        }

        command('publishing update publish results', payload, function (rsp) {
            // needs to be done this way since 
            // command is outside of angular
            if (rsp.ok === false) {
                $rootScope.$apply(deferred.reject(rsp.Message || ''));
                return;
            }
            $rootScope.$apply(deferred.resolve(rsp));
        }, function (rsp) {
            var msg = (rsp && rsp.Message) ? rsp.Message : 'unknown error';
            $rootScope.$apply(deferred.reject(msg));
        });

        return deferred.promise;
    }
}
