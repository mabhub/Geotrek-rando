'use strict';

function CategoriesListeController($scope, $rootScope, $location, utilsFactory, globalSettings, categoriesService, filtersService) {

    var initRangeFiltersEvent = $rootScope.$on('updateFilters', initRangeFilters);

    function loadCategories(forceRefresh) {
        categoriesService.getCategories(forceRefresh)
            .then(
                function (categories) {
                    $scope.categories = categories;
                }
            );
    }

    function resetRangeFilter(filter) {
        filter.min = 0;
        filter.max = filter.values.length - 1;
    }

    function initRangeValues(categoryId, filter, filterName) {
        var uid = categoryId + '_' + filterName;
        var activeFilters = filtersService.getActiveFilters();
        var valuesLength = filter.values.length;

        $scope.activeRangeValues[uid] = {
            floor: 0,
            ceil: valuesLength - 1,
            values: filter.values
        };
        if (activeFilters && activeFilters[uid]) {
            var minValue = activeFilters[uid][0].split('-')[0],
                maxValue = activeFilters[uid][0].split('-')[1],
                minIndex = 0,
                maxIndex = valuesLength - 1;

            angular.forEach(filter.values, function (value, valueIndex) {
                if (value.id.toString() === minValue.toString()) {
                    minIndex = valueIndex;
                }

                if (value.id.toString() === maxValue.toString()) {
                    maxIndex = valueIndex;
                }
            });

            $scope.activeRangeValues[uid].min = minIndex;
            $scope.activeRangeValues[uid].max = maxIndex;
        } else {
            $scope.activeRangeValues[uid].min = 0;
            $scope.activeRangeValues[uid].max = valuesLength - 1;
        }
    }

    function initRangeFilters() {
        initRangeFiltersEvent();
        var categories = $scope.categories;
        console.log(categories);

        $scope.activeRangeValues = {};

        for (var i = categories.length - 1; i >= 0; i--) {
            var category = categories[i];

            angular.forEach(category, function (property, propertyName) {
                if (property && property.type && property.type === 'range') {

                    initRangeValues(category.id, property, propertyName);

                }
            });
        }

        $scope.$on("slideEnded", function() {
            $scope.updateActiveRangeFilters();
        });

        $scope.$on('resetRange', function (event, data) {
            var eventCategory = data.category,
                filter = data.filter;
            var categories = $scope.categories;
            _.forEach(categories, function (currentCategory) {
                if (currentCategory.id.toString() === eventCategory.toString()) {
                    if (filter === 'all') {
                        _.forEach(currentCategory, function (currentFilter, currentFilterName) {
                            if (currentFilter.type === 'range') {
                                resetRangeFilter(currentCategory[currentFilterName]);
                            }
                        });
                    } else if (currentCategory[filter]) {
                        resetRangeFilter(currentCategory[filter]);
                    }
                }

            });
            $scope.categories = categories;
        });
    }

    $scope.updateActiveRangeFilters = function () {
        var categoriesRangeFilters = $scope.activeRangeValues;

        angular.forEach(categoriesRangeFilters, function (filterValues, filterName) {
            var minIndex = filterValues.min,
                maxIndex = filterValues.max;
            if (minIndex !== 0 || maxIndex !== filterValues.values.length - 1) {
                var min = filterValues.values[minIndex].id.toString();
                var max = filterValues.values[maxIndex].id.toString();
                $rootScope.activeFilters[filterName] = [min + '-' + max];
            } else {
                $rootScope.activeFilters[filterName] = null;
            }
        });

        $scope.propagateActiveFilters();
    };

    $scope.toggleCategory = function (category) {
        var categories = $rootScope.activeFilters.categories,
            indexOfCategory = categories.indexOf(category.id.toString());
        if (indexOfCategory > -1) {
            categories.splice(indexOfCategory, 1);
        } else {
            categories.push(category.id.toString());
        }
        $scope.propagateActiveFilters();
    };

    $scope.toogleCategoryFilter = function (categoryId, filterType, filterId) {
        var categoryFilter = $rootScope.activeFilters[categoryId + '_' + filterType];

        if (categoryFilter) {
            var indexOfFilter = categoryFilter.indexOf(filterId.toString());
            if (indexOfFilter > -1) {
                categoryFilter.splice(indexOfFilter, 1);
            } else {
                $rootScope.activeFilters[categoryId + '_' + filterType].push(filterId.toString());    
            }
        } else {
            $rootScope.activeFilters[categoryId + '_' + filterType] = [filterId.toString()];
        }
        $scope.propagateActiveFilters();
    };

    $scope.propagateActiveFilters = function () {
        filtersService.updateActiveFilters($rootScope.activeFilters);
        $rootScope.$broadcast('updateFilters');
    };

    $scope.isSVG = utilsFactory.isSVG;

    loadCategories();

    $rootScope.$on('switchGlobalLang', function () {
        loadCategories(true);
    });

}

module.exports = {
    CategoriesListeController: CategoriesListeController
};