import { NextRequest, NextResponse } from "next/server";


export  async function POST(request: NextRequest) {
    console.log(request)
    const formData = await request.formData();
    // const file = formData.get('file');
    console.log(formData.get('file'));
    const response = await fetch("http://localhost:8000/extract-and-process-text/",
    {
        method: 'POST',
        body: formData,
    });
    
    const data = await response.json();
    console.log(data);

    return NextResponse.json(data);
}