import React, { useEffect, useMemo, useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { CATEGORIES, fetchByCategory } from '../api/newsApi.js'
import { useNews } from '../context/NewsContext.jsx'
import './Dashboard.css'

const COLORS = ['#21E6C1', '#6C7BFF', '#FF5D5D', '#F5C451', '#4ADE80', '#C084FC', '#38BDF8']

export default function Dashboard() {
  const { country, headlines } = useNews()
  const [categoryCounts, setCategoryCounts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all(
      CATEGORIES.map((cat) =>
        fetchByCategory({ category: cat, country, pageSize: 1 }).then((res) => ({
          category: cat,
          count: res.totalResults || 0
        }))
      )
    ).then((results) => {
      if (!active) return
      setCategoryCounts(results)
      setLoading(false)
    })
    return () => { active = false }
  }, [country])

  // group today's headlines by publish hour, purely client-side aggregation
  const hourlyActivity = useMemo(() => {
    const buckets = Array.from({ length: 12 }, (_, i) => ({ hour: `${i * 2}:00`, articles: 0 }))
    headlines.forEach((a) => {
      if (!a.publishedAt) return
      const h = new Date(a.publishedAt).getHours()
      buckets[Math.floor(h / 2)].articles += 1
    })
    return buckets
  }, [headlines])

  const sourceBreakdown = useMemo(() => {
    const map = {}
    headlines.forEach((a) => {
      const name = a.source?.name || 'Unknown'
      map[name] = (map[name] || 0) + 1
    })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }))
  }, [headlines])

  return (
    <div className="container dashboard-page">
      <h1>Trends</h1>
      <p className="dashboard-sub">A live read on coverage volume, publish timing and top sources for <span className="mono-tag">{country.toUpperCase()}</span>.</p>

      <div className="dashboard-grid">
        <section className="glass-panel chart-card">
          <h3>Stories per category</h3>
          {loading ? <div className="chart-loading">Crunching category totals…</div> : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryCounts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="category" tick={{ fill: 'var(--text-faint)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-faint)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)' }} />
                <Bar dataKey="count" fill="#21E6C1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>

        <section className="glass-panel chart-card">
          <h3>Publish activity by hour</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={hourlyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="hour" tick={{ fill: 'var(--text-faint)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-faint)', fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)' }} />
              <Line type="monotone" dataKey="articles" stroke="#6C7BFF" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </section>

        <section className="glass-panel chart-card">
          <h3>Top sources right now</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={sourceBreakdown} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={3}>
                {sourceBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-dim)' }} />
              <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)' }} />
            </PieChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  )
}
