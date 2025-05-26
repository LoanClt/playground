"use client";

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { useVCFundStore } from '@/lib/store';

// Type definition for progression data sources
type ProgressionDataSource = {
  name: string;
  description: string;
  year: string;
  source: string;
  sourceUrl: string;
  data: {
    [key: string]: number;
  };
};

// Recent market data sources for progression rates
const progressionDataSources: ProgressionDataSource[] = [
  {
    name: 'Pitchbook 2023',
    description: 'North American Venture Capital progression rates',
    year: '2023',
    source: 'Pitchbook',
    sourceUrl: 'https://pitchbook.com/news/reports/q4-2023-pitchbook-nvca-venture-monitor',
    data: {
      'Pre-Seed to Seed': 52,
      'Seed to Series A': 31,
      'Series A to Series B': 46,
      'Series B to Series C': 41,
      'Series C to IPO': 26,
    },
  },
  {
    name: 'CBInsights 2022',
    description: 'Global tech startup progression rates',
    year: '2022',
    source: 'CB Insights',
    sourceUrl:
      'https://static1.squarespace.com/static/56cbee6301dbae33a826e622/t/6426fcde4e6cbc5da369b923/1680276707142/CB-Insights_State-of-Venture-Report-2022.pdf',
    data: {
      'Pre-Seed to Seed': 49,
      'Seed to Series A': 28,
      'Series A to Series B': 44,
      'Series B to Series C': 39,
      'Series C to IPO': 24,
    },
  },
  {
    name: 'Crunchbase 2021',
    description: 'U.S. startup progression rates',
    year: '2021',
    source: 'Crunchbase',
    sourceUrl:
      'https://news.crunchbase.com/venture/funding-success-failure-rates-venture-capital/',
    data: {
      'Pre-Seed to Seed': 50,
      'Seed to Series A': 33,
      'Series A to Series B': 48,
      'Series B to Series C': 43,
      'Series C to IPO': 28,
    },
  },
];

export function ProgressionPresets() {
  const { updateProbAdvancement } = useVCFundStore();

  const applyPreset = (preset: ProgressionDataSource) => {
    // Apply each progression rate from the preset
    Object.entries(preset.data).forEach(([key, value]) => {
      updateProbAdvancement(key, value);
    });

    // Show toast notification
    toast.success(`Applied ${preset.name} progression data`);
  };

  return (
    <div className='flex items-center justify-between mt-4 mb-2'>
      <div className='flex items-center gap-2'>
        <h3 className='text-sm font-medium'>Market Data Presets</h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant='ghost' size='icon' className='h-6 w-6'>
              <HelpCircle size={14} />
              <span className='sr-only'>Info</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-80' align='start'>
            <div className='space-y-2'>
              <h4 className='font-medium'>About Market Data</h4>
              <p className='text-sm text-muted-foreground'>
                These presets apply recent research data on startup progression
                rates between funding stages. Choose a preset to automatically
                configure your progression probabilities based on market research.
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className='grid grid-cols-1 gap-2'>
        {progressionDataSources.map((preset, index) => (
          <Button
            key={index}
            variant='outline'
            size='sm'
            className='text-xs h-8'
            onClick={() => applyPreset(preset)}
          >
            {preset.name} ({preset.year})
          </Button>
        ))}
      </div>
    </div>
  );
}

export function ProgressionSourcesInfo() {
  return (
    <div className='mt-4 space-y-3'>
      <h3 className='text-sm font-medium'>Market Data Sources</h3>

      <div className='grid grid-cols-1 gap-3'>
        {progressionDataSources.map((source, index) => (
          <Card key={index} className='overflow-hidden'>
            <div className='p-3 pb-2'>
              <h4 className='text-sm font-medium'>{source.name}</h4>
              <p className='text-xs text-muted-foreground'>
                {source.description} ({source.year})
              </p>
            </div>
            <div className='p-3 pt-0'>
              <div className='text-xs'>
                <div className='grid grid-cols-2 gap-x-2 gap-y-1'>
                  {Object.entries(source.data).map(([key, value]) => (
                    <div key={key} className='flex justify-between'>
                      <span>{key.replace(' to ', ' → ')}</span>
                      <span className='font-medium'>{value}%</span>
                    </div>
                  ))}
                </div>

                <div className='mt-2 pt-2 border-t'>
                  <a
                    href={source.sourceUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 dark:text-blue-400 hover:underline'
                  >
                    Source: {source.source} ({source.year})
                  </a>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
