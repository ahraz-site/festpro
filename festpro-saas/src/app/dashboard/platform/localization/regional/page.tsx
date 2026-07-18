import { getRegionalSettings, getCurrencyFormats, getDateFormats, getTimeFormats, getNumberFormats, getTimezones } from "@/lib/actions/localization"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, DollarSign, CalendarDays, Clock, Hash, MapPin } from "lucide-react"

export default async function RegionalPage() {
  const [regionalRes, currencyRes, dateRes, timeRes, numberRes, tzRes] = await Promise.all([
    getRegionalSettings(), getCurrencyFormats(), getDateFormats(), getTimeFormats(), getNumberFormats(), getTimezones(),
  ])
  if ("error" in regionalRes) return <div className="text-red-500">{regionalRes.error}</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Regional Settings</h1>
        <p className="text-sm text-gray-500">Currency, date, time, number formats & timezones</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {regionalRes.data.map((r) => (
          <Card key={r.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Globe className="h-4 w-4" /> {r.country_code}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <div className="flex justify-between"><span className="text-gray-500">Currency</span><span>{r.currency_symbol} {r.currency_code}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Timezone</span><span>{r.timezone}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Date</span><span>{r.date_format}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Time</span><span>{r.time_format}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Calendar</span><span className="capitalize">{r.calendar}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Measurement</span><span className="capitalize">{r.measurement_system.replace(/_/g, " ")}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Numbers</span><span>{r.number_group_separator}{r.number_decimal_separator}</span></div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><DollarSign className="h-4 w-4" /> Currencies</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1 max-h-60 overflow-y-auto">
            {("error" in currencyRes ? [] : currencyRes.data).map((c) => (
              <div key={c.id} className="flex justify-between py-1 border-b text-xs last:border-0">
                <span>{c.currency_code}</span><span>{c.currency_symbol} — {c.currency_name}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Date Formats</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1 max-h-60 overflow-y-auto">
            {("error" in dateRes ? [] : dateRes.data).map((d) => (
              <div key={d.id} className="flex justify-between py-1 border-b text-xs last:border-0">
                <span>{d.display_name}</span><span className="font-mono">{d.format_pattern}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Clock className="h-4 w-4" /> Time Formats</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1 max-h-60 overflow-y-auto">
            {("error" in timeRes ? [] : timeRes.data).map((t) => (
              <div key={t.id} className="flex justify-between py-1 border-b text-xs last:border-0">
                <span>{t.display_name}</span><span className="font-mono">{t.format_pattern}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><MapPin className="h-4 w-4" /> Timezones</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1 max-h-60 overflow-y-auto">
            {("error" in tzRes ? [] : tzRes.data).slice(0, 20).map((t) => (
              <div key={t.id} className="flex justify-between py-1 border-b text-xs last:border-0">
                <span>{t.display_name}</span><span className="font-mono">{t.utc_offset}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
