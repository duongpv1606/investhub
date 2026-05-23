"use client";

const ITEMS = [
  {s:"VNINDEX",p:"1.285,42",c:"+0.97%",up:true,col:"#4D7CFE"},
  {s:"HNXINDEX",p:"238,15",c:"-0.76%",up:false,col:"#4D7CFE"},
  {s:"BTC",p:"$103,420",c:"-0.40%",up:false,col:"#F7931A"},
  {s:"ETH",p:"$3,892",c:"+2.15%",up:true,col:"#F7931A"},
  {s:"XAU/USD",p:"$3,342",c:"+0.46%",up:true,col:"#FFD166"},
  {s:"SJC",p:"110.5M₫",c:"+0.45%",up:true,col:"#FFD166"},
  {s:"XRP",p:"$2.48",c:"-1.20%",up:false,col:"#F7931A"},
  {s:"VCB",p:"88.5k",c:"+0.34%",up:true,col:"#4D7CFE"},
  {s:"HPG",p:"28.9k",c:"+2.12%",up:true,col:"#4D7CFE"},
  {s:"FPT",p:"142k",c:"+3.27%",up:true,col:"#4D7CFE"},
  {s:"DXY",p:"104.2",c:"-0.18%",up:false,col:"#94A3B8"},
];

export function MarketTicker() {
  const items = [...ITEMS,...ITEMS];
  return (
    <div style={{
      overflow:"hidden",
      borderBottom:"1px solid rgba(255,255,255,0.05)",
      background:"rgba(3,6,18,0.7)",
      height:"36px",
      display:"flex",
      alignItems:"center",
      position:"relative",
    }}>
      <div style={{position:"absolute",left:0,top:0,bottom:0,width:"36px",background:"linear-gradient(to right,rgba(5,8,22,1),transparent)",zIndex:1}}/>
      <div style={{position:"absolute",right:0,top:0,bottom:0,width:"36px",background:"linear-gradient(to left,rgba(5,8,22,1),transparent)",zIndex:1}}/>
      <div className="ticker-run" style={{display:"flex",width:"max-content"}}>
        {items.map((item,i)=>(
          <div key={i} style={{
            display:"flex",alignItems:"center",gap:"9px",
            padding:"0 20px",
            borderRight:"1px solid rgba(255,255,255,0.04)",
            whiteSpace:"nowrap",
          }}>
            <span className="ticker-sym" style={{color:item.col}}>{item.s}</span>
            <span className="ticker-price">{item.p}</span>
            <span className="ticker-chg" style={{color:item.up?"#00FFB2":"#FF4D6D"}}>{item.c}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
