import { useMemo } from 'react'
import { TimelineEvent, Repository } from '@/lib/types'
  AreaCh
  Area,
  AreaChart,
  CartesianGrid,
  Legen
  LineChart,
  Pie,
} from '
import { B
import {
  ChartBa
  Tren
  Pulse,
import { cn
  Pie,
  Cell,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ChartLine,
  ChartBar,
  ChartPie,
  TrendUp,
  TrendDown,
  Pulse,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'


    const now = Date.now(

    let currentGover


      const dayEnd = date.
      const dayEven
        return

        const latestEvent
          const scoreCh
 

          }
      } else {
        current
      }
      dataPoints.
 

      })

  }, [events, r
  const eventCo
 

      const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' 
        date: dateKey,
        governance: 0,
      })


      const existing = counts.get(dateKey)
      if (existing) {
        if (event.type === 'governance') existing.govern


  }, [events])
  const severityData = useMemo(() => {

      warning: 0,
      critical: 0,

      if (event.severity in counts) {


      { name: 'Success', value: counts.success, color: '#
      { name: 'Warning', value: counts.warning, color: '#FA
      { 

  const stats = useMemo(() => {
      const daysAgo = (Date.now() - new Date(e.timestamp).g
    })
    const prev7Days = events.filter((e) => {
      retu

      scoreHistoryData.slice(-7).reduce((sum, d) => sum + d.healthScore, 0) / 7
      scoreHistoryData.slice(-14, -7).reduce((sum, d) => sum + d.healthScore, 0) / 7
    const healthChange = ((currentAvgHealth - prevAvgHealth) / prevAvgHealth) * 100
          }
      eve
      } else {
    }

    <div className={cn('space-y-6', className)}>
      }

            </span>
              <TrendUp size={16} class
              <TrendDown size={16} className="text-[var(--aura-coral)]" />
          </div>
            {stats.avgHealth}
          <div className="mt-1 text-xs text-muted-f
      })
     

              {stats.
            vs prev 

        <Card className="p-4 border-bord
            <span className="text-xs text-muted-fore
            </span>

            {stats.eventsLast7Days}
          <div className="mt-1 text-xs text-muted-foregrou
              className={cn(
                stats.event
        date: dateKey,
              {st
        governance: 0,
        </Card>
      })
     

          </div>
            {events.length}
          <div className="mt-1 text-xs text-muted-foreground">
      const existing = counts.get(dateKey)

      if (existing) {
          <TabsTrigger value="scores">
            Score Trends
          <TabsTrigger value="activity">
       
      

        </TabsList>
  }, [events])

  const severityData = useMemo(() => {
                </h3
                 
              
      warning: 0,
               
      critical: 0,
     

                  <span classNa
      if (event.severity in counts) {
            <ResponsiveContainer
       
      

            
                  </linearGradient>
                    <stop offset="5%" stopColor="#FACC15" sto
                  </linearGradient>
                <CartesianGrid strokeDasharray="3 3" stroke="#1
                  dataKey="date"
                  fontSize={11}
              

  const stats = useMemo(() => {
                  domain={[0, 100]}
                <Tooltip
                    backg
    })

    const prev7Days = events.filter((e) => {
                  type="monotone"
                  stroke="#4FD1C5"
      

                  type="mono
      scoreHistoryData.slice(-7).reduce((sum, d) => sum + d.healthScore, 0) / 7
                  fill="u
      scoreHistoryData.slice(-14, -7).reduce((sum, d) => sum + d.healthScore, 0) / 7

    const healthChange = ((currentAvgHealth - prevAvgHealth) / prevAvgHealth) * 100

            
            </ResponsiveContainer>
        </TabsContent>
        <TabsContent value="activity" className="space-y-4 mt-4">
            <div className="mb-4">
                Event Activity (30 days)
    }
              </p>

          
    <div className={cn('space-y-6', className)}>
                  fontSize={11}
                  interval="preserveStartEnd"
                <YAxis stroke="#6B7280" fontSize={11} tickLine={fa
                  contentStyle={{
                    border: '
            </span>
                  labelStyle={{ color: '
                <Legend
                 
              <TrendDown size={16} className="text-[var(--aura-coral)]" />
              
          </div>
                />
            {stats.avgHealth}
          </Card

          <div cl
              <div className
                <p className="te
                </p>
              <R
             
                    cx="50%"
                    labelLine={false}
                    oute
                    data
                
               

                      backgroundColor: '#11151C',
                      borderRadius: '8px',
                    }}
                </PieChar
            </span>
            <Card className="p-6 border-border bg-card/50">
                
              </div>
            {stats.eventsLast7Days}
                
                        <div
                 
              className={cn(
                      <div class
                        <Badge variant="outline" className="font-mono text-xs">
                
            >
                      <div
                        style={{
                        
                      />
                
        </Card>

      </Tabs>
  )




          </div>

            {events.length}

          <div className="mt-1 text-xs text-muted-foreground">

          </div>





          <TabsTrigger value="scores">

            Score Trends

          <TabsTrigger value="activity">







        </TabsList>











              </div>





















                  </linearGradient>



                  </linearGradient>







                  dataKey="date"

                  fontSize={11}





                  fontSize={11}

                  domain={[0, 100]}

                <Tooltip







                />

                  type="monotone"

                  stroke="#4FD1C5"







                  stroke="#A78BFA"



                />



                  stroke="#FACC15"





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







                <Legend


                />








              </BarChart>











                </p>





                    cx="50%"

                    labelLine={false}











                      backgroundColor: '#11151C',

                      borderRadius: '8px',

                    }}



            </Card>

            <Card className="p-6 border-border bg-card/50">



              </div>





                        <div







                        <Badge variant="outline" className="font-mono text-xs">





                      <div

                        style={{



                      />







      </Tabs>

  )

