// Fetch and analyze the pond data
async function analyzePondData() {
  try {
    console.log("Fetching pond data from CSV...")
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pond_data_with_pondid_timestamp-wjxMdbaXEAfKL4QoX0MGz34XLyRHDf.csv",
    )
    const csvText = await response.text()

    console.log("CSV Data fetched successfully")
    console.log("First 500 characters:", csvText.slice(0, 500))

    // Parse CSV data
    const lines = csvText.trim().split("\n")
    const headers = lines[0].split(",")
    console.log("Headers:", headers)

    const data = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",")
      const row = {}
      headers.forEach((header, index) => {
        row[header.trim()] = values[index]?.trim()
      })
      data.push(row)
    }

    console.log(`Total records: ${data.length}`)
    console.log("Sample record:", data[0])

    // Analyze pond IDs
    const pondIds = [...new Set(data.map((row) => row.PondID))]
    console.log("Unique Pond IDs:", pondIds)

    // Analyze data by pond
    pondIds.forEach((pondId) => {
      const pondData = data.filter((row) => row.PondID === pondId)
      console.log(`\nPond ${pondId}:`)
      console.log(`- Records: ${pondData.length}`)

      // Get latest record
      const latest = pondData[pondData.length - 1]
      console.log("- Latest data:", {
        timestamp: latest.Timestamp,
        pH: latest.pH,
        temp: latest.Temp,
        DO: latest.DO,
        status: latest.Status,
      })

      // Calculate averages
      const avgTemp = pondData.reduce((sum, row) => sum + Number.parseFloat(row.Temp || 0), 0) / pondData.length
      const avgPH = pondData.reduce((sum, row) => sum + Number.parseFloat(row.pH || 0), 0) / pondData.length
      const avgDO = pondData.reduce((sum, row) => sum + Number.parseFloat(row.DO || 0), 0) / pondData.length

      console.log("- Averages:", {
        temperature: avgTemp.toFixed(1),
        pH: avgPH.toFixed(1),
        dissolvedOxygen: avgDO.toFixed(1),
      })
    })

    // Analyze time range
    const timestamps = data.map((row) => new Date(row.Timestamp)).sort()
    console.log("\nTime Range:")
    console.log("- Earliest:", timestamps[0])
    console.log("- Latest:", timestamps[timestamps.length - 1])

    return { data, pondIds, headers }
  } catch (error) {
    console.error("Error analyzing pond data:", error)
  }
}

// Run the analysis
analyzePondData()
