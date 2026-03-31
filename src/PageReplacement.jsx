import React from 'react'
import { Box, Text, useInput, render } from 'ink'
import { Badge, StatusMessage, TextInput } from '@inkjs/ui';
import BigText from 'ink-big-text';
let app;
const PageReplacement = ({ fSize, fSeq }) => {
    const frameSize = Number(fSize);
    const pageSeq = fSeq;
    const index = React.useRef(0)
    const hit = React.useRef(0);
    const miss = React.useRef(0);
    const [currentPageSeqIdx, setCurrentPageSeqIdx] = React.useState(0)
    const [frames, setFrames] = React.useState([]);
    const [log, setLog] = React.useState([]);

    const windowHeight = 9
    const [startInx, setStartInx] = React.useState(0);
    const logInView = log.slice(startInx, startInx + windowHeight);

    React.useEffect(() => {
        setStartInx(Math.max(0, log.length - windowHeight))
    }, [log.length])

    useInput((input, key) => {
        if (key.upArrow && log.length > windowHeight) {
            setStartInx((prev) => {
                if (prev > 0) {
                    return prev - 1
                }
                return prev
            })
        }
        if (key.downArrow && log.length > windowHeight) {
            setStartInx((prev) => {
                if (prev != log.length - windowHeight) {
                    return prev + 1
                }
                return prev
            })
        }

    })

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    React.useEffect(() => {
        let fifo = async () => {
            let currentFrame = []
            for (let i = 0; i < pageSeq.length; i++) {
                setCurrentPageSeqIdx(i);
                if (currentFrame.includes(pageSeq[i])) {
                    hit.current++;
                    setLog((prev) => [...prev, { found: true, msg: `Page ${pageSeq[i]} found` }])
                }
                else {
                    miss.current++;
                    currentFrame[index.current] = pageSeq[i]
                    index.current = (index.current + 1) % frameSize;
                    setFrames([...currentFrame]);
                    setLog((prev) => [...prev, { found: false, msg: `Page ${pageSeq[i]} not found` }])
                }
                await sleep(500);
            }
        }
        fifo();
    }, []);

    return (
        <>

            <Box flexDirection='row'>
                <Box width={'80%'} paddingLeft={1} paddingRight={1} flexDirection='column' borderStyle={'round'} borderColor={'cyanBright'}>
                    <Box flexDirection='column'>
                        <Text>Frame Size: {frameSize}</Text>
                        <Text>Page Sequence:
                            [{pageSeq.map((item, idx) => idx !== (pageSeq.length - 1) ? <Text key={idx} color={idx === currentPageSeqIdx ? 'green' : 'white'}>{item}, </Text> : <Text key={idx} color={idx === currentPageSeqIdx ? 'green' : 'white'}>{item}</Text>)}]
                        </Text>
                    </Box>
                    <Box paddingLeft={1} paddingRight={1} borderStyle={'round'} borderColor={'green'} gap={1}>
                        {
                            frames.map((item, idx) => (
                                <Box borderStyle={'round'}
                                    width={`${Math.round(100 / frameSize)}%`}
                                    height={7} borderDimColor
                                    alignItems='center'
                                    justifyContent='center'
                                    key={idx}
                                >
                                    <BigText font="chrome" space text={item.toString()} />
                                </Box>
                            ))
                        }
                    </Box>
                </Box>
                <Box width={'20%'} paddingLeft={1} paddingRight={1} flexDirection='column' borderStyle={'round'} borderColor={'cyanBright'}>
                    <Box marginBottom={1}><Text>Logs</Text></Box>
                    {
                        logInView.map((log, idx) => (
                            <StatusMessage
                                key={idx}
                                variant={log.found? 'success': 'error'}
                            >
                                {log.msg}
                            </StatusMessage>))
                    }
                </Box>
            </Box>
            <Box paddingLeft={1} paddingRight={1} flexDirection='row' borderStyle={'round'} borderColor={'cyanBright'} justifyContent='space-between'>
                <Badge color={'green'}>Total Hits: {hit.current}</Badge>
                <Badge color={'red'}>Total Misses: {miss.current}</Badge>
                <Badge color={'blue'}>Hit ratio : {(hit.current / pageSeq.length).toFixed(2)}</Badge>
                <Badge color={'yellow'}>Miss ratio: {(miss.current / pageSeq.length).toFixed(2)}</Badge>
            </Box>
        </>
    )
}

const ReferenceStringInput = () => {
    const [active, setActive] = React.useState(0)
    const [frameSize, setframeSize] = React.useState(0);
    const [frameSeq, setFrameSeq] = React.useState([])

    if (frameSeq.length > 0) {
        return <PageReplacement fSize={frameSize} fSeq={frameSeq} />
    }
    return (
        <>
            <Box flexDirection='column'>
                <Box>
                    <Text>Enter a frame size: </Text>
                    <TextInput
                        isDisabled={active != 0}
                        onChange={setframeSize}
                        onSubmit={() => setActive(1)}
                    />
                </Box>
                <Box>
                    <Text>Enter a frame sequence: [</Text>
                    <TextInput
                        isDisabled={active != 1}
                        onSubmit={(val) => {
                            const newFrameSeq = val.split(',');
                            setFrameSeq(newFrameSeq)
                        }}
                    />
                    <Text>]</Text>
                </Box>
            </Box>
        </>
    )
}

app = render(<ReferenceStringInput />)