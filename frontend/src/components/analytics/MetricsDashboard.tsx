
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AreaChart, DonutChart, BarChart } from '@tremor/react';

const chartdata = [
  { date: 'Jan 22', Organic: 2890, Paid: 2338 },
  { date: 'Feb 22', Organic: 2756, Paid: 2103 },
  { date: 'Mar 22', Organic: 3322, Paid: 2194 },
  { date: 'Apr 22', Organic: 3470, Paid: 2108 },
  { date: 'May 22', Organic: 3475, Paid: 1812 },
  { date: 'Jun 22', Organic: 3129, Paid: 1726 },
];

const trafficSource = [
  { name: 'Google Search', value: 9800 },
  { name: 'Direct', value: 4567 },
  { name: 'Social', value: 3908 },
  { name: 'Referral', value: 2400 },
];

const valueFormatter = (number: number) => `$ ${new Intl.NumberFormat('us').format(number).toString()}`;

export const MetricsDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* KPI 1: Traffic Growth */}
        <Card className="col-span-1 lg:col-span-2 bg-card/50 backdrop-blur border-border/50 p-6">
            <h3 className="text-tremor-content-strong dark:text-dark-tremor-content-strong font-medium">Traffic Growth & Sources</h3>
            <AreaChart
                className="mt-4 h-72"
                data={chartdata}
                index="date"
                categories={['Organic', 'Paid']}
                colors={['indigo', 'rose']}
                yAxisWidth={60}
                onValueChange={(v) => console.log(v)}
                showAnimation={true}
            />
        </Card>

        {/* KPI 2: Source Breakdown */}
        <Card className="col-span-1 bg-card/50 backdrop-blur border-border/50 p-6">
            <h3 className="text-tremor-content-strong dark:text-dark-tremor-content-strong font-medium">Traffic Sources</h3>
            <DonutChart
                className="mt-6"
                data={trafficSource}
                category="value"
                index="name"
                valueFormatter={valueFormatter}
                colors={['slate', 'violet', 'indigo', 'rose']}
                showAnimation={true}
            />
        </Card>

        {/* KPI 3: Engagement */}
        <Card className="col-span-1 lg:col-span-3 bg-card/50 backdrop-blur border-border/50 p-6">
            <h3 className="text-tremor-content-strong dark:text-dark-tremor-content-strong font-medium">Monthly Active Users</h3>
             <BarChart
                className="mt-6 h-60"
                data={chartdata}
                index="date"
                categories={['Organic', 'Paid']}
                colors={['blue', 'teal']}
                yAxisWidth={48}
                showAnimation={true}
            />
        </Card>
    </div>
);
