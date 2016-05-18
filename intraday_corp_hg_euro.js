
(function () {

    //global chart variabls
    var chart;
    //global chart options
    var options;

    //create trace volume chart   
    function intraday_corp_hg_euro_chart() {
       
        //increments current_line when instantiating chart so start at 6:59
        var current_line = 0;

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
                                                    //if between 8am and 5pm
                                                    if ( (date[3] >= 8 && date[3] <= 16) || (date[3] == 17 && date[4] == 0) ){
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
                        text: 'Time',
                        style: {
                            color: '#4D759E',
                            fontWeight: 'bold'
                        }
                    },
                    gridLineWidth: .5,
                    type: 'datetime',
                    tickInterval: (1000*60*30),
                    labels: {
                        align: 'right',
                    },
                    dateTimeLabelFormats: {
                        hour: '%l',
                        minute: '%l:%M'
                    },
                    labels: {
                            formatter: function(){
                                if (this.isFirst){
                                    return Highcharts.dateFormat(this.dateTimeLabelFormat, this.value) + " AM";
                                }
                                else if (this.isLast){
                                    return Highcharts.dateFormat(this.dateTimeLabelFormat, this.value) + " PM";
                                }
                                else
                                    return Highcharts.dateFormat(this.dateTimeLabelFormat, this.value);
                            }
                        }
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
                        minute: '%A, %b %e, %Y %l:%M %p'
                    }
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
                    column: {
                        pointPadding: 0,
                        borderWidth: 0,
                        //have colums next to each other rather than stack
                        stacking: undefined
                    },
                    line: {
                        //make data label markers always a circle
                        marker: {
                            symbol: 'circle'
                        }
                    },
                    //set max data in series to 5000 
                    series: {
                        turboThreshold: 5000
                    }
                },
                //set name of chart downloads
                exporting: {
                    filename: 'MarketAxess_trax_intraday_corp_hg_euro',
                    //enable download icon
                    enabled: false,
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
            thousandsSep: ','
        }
    });

    //create chart
    intraday_corp_hg_euro_chart();

    //set chart to reset everyday at 8am London Time 
    function dailyReset(){
        var delay;
        //transfrom current time to london tome
        var now = moment().tz("Europe/London");

        //if its time to reset
        if (now.hours() == 8 && now.minutes() == 0){
            $('#intraday_corp_hg_euro_container').highcharts().destroy();
            intraday_corp_hg_euro_chart();
            delay = 24*60*60*1000; //one day in milliseconds
        }
        else {
            //create moment date object as 8am in London Time
            var nextReset = moment().tz("Europe/London"); 
            nextReset.hours(8);
            nextReset.minute(0);
            nextReset.milliseconds(0);
            //find the difference and set as delay
            var delay = nextReset.diff(now);
            //if the next reset is the follow day set delay as such
            if (delay < 0){
                delay += 24*60*60*1000; //one day in milliseconds
            }
        }
        setTimeout(dailyReset,delay);
    };

    dailyReset();

})();


