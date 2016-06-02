
(function () {

    //global chart variabls
    var chart;
    //global chart options
    var options;

    //images for pause and start button
    var imgPaused = 'pause_icon.png';
    var imgStart = 'start_icon.png';
    //icon currently displayed
    var imgState = 'pause_icon.png';

    //create trace volume chart   
    function intraday_corp_hg_euro_chart() {
       
        //increments current_line when instantiating chart so start at 6:59
        var current_line = 0;

        //is chart paused
        var isPaused = false;

        var jqxhr_trax_intraday = $.get('../../datafiles/widget_data/TRAX_Corp-IG_EUR.csv', function (data) {

            //set up chart 
            options = {
                //set chart type
                chart: {
                    type: 'spline',
                    defaultSeriesType: 'spline',
                    renderTo: 'intraday_corp_hg_euro_container',
                    marginRight: 10,
                    alignTicks: false,
                    events: {
                         load: function getNewData() {
                            if (!isPaused){
                                // set up the updating of the chart each minutes
                                $.get('../../datafiles/widget_data/TRAX_Corp-IG_EUR.csv', function (values) {
                                        if (chart != undefined && chart.series != undefined){
                                            var lines = values.split('\n');
                                            //if first call find the most recent line in csv
                                            if (current_line === 0){
                                                current_line = chart.series[0].data.length + 1; 
                                            }
                                            //make sure the line is defined
                                            //and the chart is not being reset
                                            if (lines[current_line] != undefined){
                                                var line = lines[current_line];
                                                var info = line.split(',');
                                                var date = info[0].trim().split(/[./-\s:]/);
                                                //make sure we havent over stepped
                                                if (info[1] != undefined && info[1].trim() != 'NA'){ 
                                                    //if between 7am and 9pm
                                                    if ( (date[3] >= 7 && date[3] <= 20) || (date[3] == 21 && date[4] == 0) ){
                                                        var x;
                                                        //check date format
                                                        if (date[0].length < 4){
                                                            //mm/dd/YYYY
                                                            x = Date.UTC(date[2], date[0] - 1, date[1], date[3], date[4]);
                                                        }
                                                        //YYYY/mm/dd
                                                        else {
                                                            x = Date.UTC(date[0], date[1] - 1, date[2], date[3], date[4]);
                                                        }
                                                        var y = parseInt(info[1])/1000000000;
                                                        //add point
                                                        chart.series[0].addPoint([x,y]);
                                                        //increment call number
                                                        current_line++;
                                                    }
                                            }
                                        }
                                    }
                                });
                                //call 5 seconds past every minute so csv file has time to update
                                var now = new Date();
                                var nextMin = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1, 5, 0);
                                var delay = nextMin - now;
                                setTimeout(getNewData, delay);
                            }
                        }
                    }
                },

                //set title 
                title: {
                    text: 'Active High Grade Eurobonds',
                    style: {
                        color: '#4D759E'
                    },
                    align: 'center'
                },
                //set x-axis 
                xAxis: [{
                    title: {
                        text: 'London Time',
                        style: {
                            color: '#4D759E',
                            fontWeight: 'bold'
                        }
                    },
                    gridLineWidth: .5,
                    type: 'datetime',
                    tickInterval: (1000*60*60),
                    labels: {
                        rotation: -60,
                        align: 'right',
                    },
                    dateTimeLabelFormats: {
                        hour: '%k:%M',
                        minute: '%k:%M'
                    },
                    }],
                //set y-axis 
                yAxis: {
                    title: {
                        text: 'Total Daily Flow ( Billions EUR )',
                        style: {
                            color: '#4D759E',
                            fontWeight: 'bold'
                        },
                        margin: 80
                    },
                    labels: {
                        format: '{value: f}'
                    },
                    minPadding: 0.2,
                    maxPadding: 0.2,
                    min: 0
                },
                //set tooltip formatting      
                tooltip: {
                    valuePrefix: '€',
                    valueSuffix: ' Billion',
                    valueDecimals: 2,
                    pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>',
                    dateTimeLabelFormats: {
                        minute: '%A, %b %e, %Y %k:%M'
                    },
                    shared: true
                },
                //set legend
                legend: {
                    layout: 'horizontal',
                    align: 'center',
                    borderWidth: 1,
                    borderRadius: 5
                },
                //instantiate series
                series: [{
                    data: []
                }],
                //set colors for series                             
                colors: ['#002244', '#DBBB33', '#639741', '#a65300', '#43C5F3'],
                
                //set general plot options
                plotOptions: {
                    //set max data in series to 5000 
                    series: {
                        turboThreshold: 5000,
                        marker: {
                            symbol: 'circle',
                            enabled: false
                        }
                    }
                },
                //set name of chart downloads
                exporting: {
                    filename: 'MarketAxess_trax_intraday_corp_hg_euro',
                    //enable icons
                    enabled: true,
                    //add image to download 
                    chartOptions: {
                        chart: {
                            events: {
                                load: function () {
                                    this.renderer.image('http://www.marketaxess.com/images/marketaxess_logo2.gif', 90, 75, 300, 48).attr({
                                        opacity: 0.1
                                        }).add();
                                }
                            }
                        }
                    },
                    buttons: {
                        contextButton: {
                            //disable download button
                            enabled: false
                        },
                        toggle: {
                            symbol: 'url(' + imgState + ')',
                            symbolY: 11,
                            _titleKey: 'buttonTitle',
                            onclick: function () {
                                var button = this.exportSVGElements[1].element;
                                if (isPaused){
                                    //then restart chart 
                                    imgState = imgPaused;
                                    intraday_corp_hg_euro_chart();
                                }
                                else{
                                    //pause chart
                                    imgState = imgStart;
                                    isPaused = true;
                                }
                                button.attributes[1].value = imgState;
                            }
                        }
                    }
                },
                //disable credits
                credits: {
                    enabled: false
                }
            };

            //names of labels in order of series
            var names = ['Today', 'Yesterday', 'Average (Last 30 Days)', 'Highest (Last 30 Days)', 'Lowest (Last 30 Days)'];            

            //get csv file divide by 1 billion and populate chart
            readTimeCSV(options, data, 1000000000, names);

            //make the today line abover the rest
            for (var i = 0; i < options.series.length; i++){
                options.series[i].zIndex = options.series.length - i - 1;
            }

            //add dates to today and yesterday labels 
            var curDate = new Date(options.series[1].data[0].x);
            var today = curDate.toString().split(" ").splice(1,2);
            options.series[0].name = options.series[0].name + " (" + today[0] + " " + today[1] + ")";

            var yesterday = new Date(curDate.getTime() - (1000 * 60 * 60 * 24));
            var dayBefore = yesterday.toString().split(" ").splice(1,2);
            options.series[1].name = options.series[1].name + " (" + dayBefore[0] + " " + dayBefore[1] + ")";

            //make yesterday line dashed
            options.series[1].dashStyle = 'Dash';

            //add date to highest and lowest labels
            var topLine = data.split('\n')[0].split(',');
            var highest = topLine[4].split('_')[3].split('-');
            var lowest = topLine[5].split('_')[3].split('-');
            //check if it got quotation mark
            if (highest[2].length > 2) highest[2] = highest[2].substring(0,2);
            if (lowest[2].length > 2) lowest[2] = lowest[2].substring(0,2);
            
            var highestDate = new Date(highest[0], highest[1], highest[2]);
            var lowestDate = new Date(lowest[0], lowest[1], lowest[2]);
            var highLabel = highestDate.toString().split(" ").splice(1,2);
            var lowLabel = lowestDate.toString().split(" ").splice(1,2);
            options.series[3].name = options.series[3].name + " " + highLabel[0] + " " + highLabel[1];
            options.series[4].name = options.series[4].name + " " + lowLabel[0] + " " + lowLabel[1];
           
            //create chart
            chart = new Highcharts.Chart(options);

            })
                //catch error and display them
                .fail(function (jqxhr_trax_intraday, exception) {
                    ajaxError(jqxhr_trax_intraday, exception, '#intraday_corp_hg_euro_container');
            });
    }


    //set high level chart options for all charts
    Highcharts.setOptions({
        lang: {
            thousandsSep: ',',
            buttonTitle: 'Pause/Start' //hover title of pause start button
        }
    });

    //know if chart has been created or not
    first_call = true

    //set chart to reset everyday at 7am London Time 
    function dailyReset(){
        var delay;
        //transfrom current time to london tome
        var now = moment().tz("Europe/London");
        //if chart exists reset it
        if (first_call == false){
            $('#intraday_container').highcharts().destroy();
        }
        first_call = false;

        //create chart
        intraday_corp_hg_euro_chart();

        //create moment date object as 8am in London Time
        var nextReset = moment().tz("Europe/London"); 

        //15 seconds delay to give new csv time to populate
        nextReset.hours(7);            
        nextReset.minute(0);
        nextReset.seconds(15);
        nextReset.milliseconds(0);
        //find the difference and set as delay
        var delay = nextReset.diff(now);
        //if the next reset is the follow day set delay as such
        if (delay < 0){
            delay += 24*60*60*1000; //one day in milliseconds
        }
        setTimeout(dailyReset,delay);
    };

    dailyReset();

})();


