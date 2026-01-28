import { useMemo } from 'react'
import { TimelineEvent, Repository } from '@/lib/types'
  AreaCh
  BarCh
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  Legend,
  Line,
  LineChart,
} from
  PieChart,
  ResponsiveContainer,
  Tooltip,
interfac
  repo: 
}
export function HealthTrendCharts({ events,
    const dataPoints: Array<{ date: string; h

    let 
    for (let
      const
      const
        re

        
          const scoreChange = 


        }
        currentHealthScor

        date: date.t
 

    return dataPoints

    const counts = new Map<string, { date: string; scan: number; governance: number; healing: nu
    events.forEach((event)

      if (!counts.has(dateKey)) {
          date: dateKey,

        })

      if (existing) {
        else if (event.type === 'governance') existing.governance++
      }

  }, [events])
      })

      warning: 0,
      critical: 0,

      if (event.severity in counts) {
      }

      { name: 'Success', value: counts.success, co
      { name: 'Warning', value: counts.warning, color: '#FACC15' },
          }
  }, [eve
      } else {
      const daysAgo = (Date.now() - new Date(e.timestamp).getTime()) / (1000 * 6
      }

    })
    const currentAvgHealth =
    const prevAvgHealth =
    const healthChange = ((currentAvgHealth - prevAvgHealth)
      })
     

  }, [events, scoreHi
  return (

          <div className="flex items-cen
            {stats.healthChange >= 0 ? (

            )}
          <div className="text-2xl font-mono
            <span

              )}
              {stats.healthCh
            </span>{' '}
          </div>

          <div classN
          
       

      const existing = counts.get(dateKey)
      if (existing) {
              {stats.eventChange >= 0 ? '+' : ''}
            </span>{' '}
          </div>

      

          <div className="mt-1 text-xs text-muted
  }, [events])

  const severityData = useMemo(() => {
            Score Tr
          <TabsTr
            Ac
      warning: 0,
            Sev
      critical: 0,
     

                <ChartLine size
      if (event.severity in counts) {
                Historical health and governance scores
       
      

            
                  </linearGradient>
                    <stop offset="5%" stopColor="#A78BFA" sto
                  </linearGradient>
                <CartesianGrid strokeDasharray="3 3" stroke="#1
                  dataKey="date"
                  fontSize={11}
              

  const stats = useMemo(() => {
                    borderRadius: '8px',
                  labelStyle={{ color: '#9CA3AF' }}
                <Legend
    })
    const prev7Days = events.filter((e) => {
                  type="monotone"
                  stroke="#4FD1C5"
      

                  type="mono
      scoreHistoryData.slice(-7).reduce((sum, d) => sum + d.healthScore, 0) / 7
                  fill="u
      scoreHistoryData.slice(-14, -7).reduce((sum, d) => sum + d.healthScore, 0) / 7
    const healthChange = ((currentAvgHealth - prevAvgHealth) / prevAvgHealth) * 100

        <Tab
            <div className="mb-4">
                <ChartBar size={20} className="text-[va
              </h3>
                Daily event counts by type
    }
            <ResponsiveContainer

          
    <div className={cn('space-y-6', className)}>
                />
                <Tooltip
                    backgroundColor: '#11151C',
                    borderRadius: '8px',
                />
                <Bar dataKey="scan" fill="#4FD1C5" name="Scans" stackId
                <
              <TrendDown size={16} className="text-[var(--aura-coral)]" />
        </Tabs
          </div>
            <div className="mb-4">
                <ChartPie size={20} className="text-[var(--aur
              </h
              className={cn(
            </div>
            <ResponsiveContainer width="100%" height={300}>
                
            >
                  labelLine={false}
                  fill="#8884d8"
                  label=
                  {sev
                
        </Card>

                    borderRadius: '8px',
                />
            </ResponsiveContainer>
            <Card className="mt-4 p-4 border-border bg-card/30">
          </div>
                    <div className="flex items-center gap-2">
          <div className="mt-1 text-xs text-muted-foreground">
                 
                    </div>
                      {item.valu
                  </div>
              </
          </C
      </Tabs>
  )


          </div>













          <TabsTrigger value="scores">

            Score Trends

          <TabsTrigger value="activity">







        </TabsList>



















                  </linearGradient>



                  </linearGradient>



                  dataKey="date"

                  fontSize={11}



                <Tooltip






                />






                  type="monotone"

                  stroke="#4FD1C5"







                  stroke="#A78BFA"



                />

            </ResponsiveContainer>

        </TabsContent>

        <TabsContent value="activity" className="space-y-4 mt-4">

            <div className="mb-4">


                Event Activity (30 days)



              </p>






                  dataKey="date"

                  fontSize={11}
                  interval="preserveStartEnd"



                  contentStyle={{




                />




              </BarChart>















































                      <div


                      />











      </Tabs>

  )

