import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigge
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
  Warning,
import {
  ShieldCh
  Info,
import { Tim

  events: T

  const [e

    if (filter === 'all') retu
  })
  const getSeverityIcon = (severity: Timeli
      case 'success':

        return Warning
        return XCircle
 


    switch (event.severity) {
        return {

        }
      case 'critical':
          bg: 'bg-[var(--aura-ye
    

  const getSeverityIcon = (severity: TimelineEvent['severity']) => {
    switch (severity) {
      case 'success':
        return CheckCircle
      case 'warning':
      case 'critical':
        return Warning
      case 'error':
        return XCircle
      case 'info':
      default:
        return Info
    }
  }

  const getEventColor = (event: TimelineEvent) => {
    switch (event.severity) {
      case 'success':
        return {
          bg: 'bg-[var(--aura-aqua)]/10',
          border: 'neon-border-aqua',
          text: 'text-[var(--aura-aqua)]',
        }
      case 'warning':
      case 'critical':
        return {
          bg: 'bg-[var(--aura-yellow)]/10',
          border: 'neon-border-yellow',
          text: 'text-[var(--aura-yellow)]',
        }
      case 'error':
        return {

    <div className="space-y-4">
        <div className="flex items-center g
         
            {filte
        </div>
          <Butto
            variant="outline"
            disabled={filteredEvents.
            <Download size={16} />
         
     
   

              <SelectItem value="healing">Healing</Selec
            </Selec
        </div>

        <div classNam
            <div className
            </div>
            filteredEve
              
              const
     
   

                    colors.bg,
                  )}
                >
                    <div className={cn('flex-shri
                    </div>
                      <div className="flex items-s
                          <span className="font-sp

                              className
                              <SeverityIcon size
                            </Badge>
                        </div>
                          {formatRel
   

                          <div
         
                          
                                .filter(([key
                               
                 
                       
                                    </s
          
       
                                    <span className="text-muted-foreground">Score:</span>
                                      {even
                                    <span c
                  
                                  </div>
               
                        </div>
                    </div>
                </div
            })
     
   

































































































































