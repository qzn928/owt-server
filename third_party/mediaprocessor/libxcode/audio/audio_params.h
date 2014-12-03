/* <COPYRIGHT_TAG> */

#ifndef __AUDIO_PARAMS_H__
#define __AUDIO_PARAMS_H__
#include "base/media_common.h"
#include "base/mem_pool.h"
#include "base/stream.h"

#define MAX_APP_INPUT 16
#define AAC_FRAME_SIZE (1024*2*12+32)
#define AUDIO_OUTPUT_QUEUE_SIZE 32

struct sAudioParams
{
    StreamType nCodecType;
    int nSampleRate;
    unsigned int nBitRate;
    MemPool* input_stream;
    Stream* output_stream;
};

struct AudioStreamInfo
{
    int codec_id;
    int sample_rate;
    int channels;
    int bit_rate;
    int sample_fmt;
    unsigned long channel_mask;
};

struct AudioPayload
{
    unsigned char* payload;
    int payload_length;
    bool isFirstPacket;
};

typedef struct APPFilterParameters {
    //pcm audio parameters
    unsigned int sample_rate;     /// f.e. 44100
    unsigned int resolution;      ///  8, 16, 32 bits, etc
    unsigned int channels_number;

    bool vad_enable;
    unsigned int vad_prob_start_value;

    bool agc_enable;
    unsigned int agc_level_value;

    bool front_end_denoise_enable;
    int front_end_denoise_level;

    bool back_end_denoise_enable;
    int back_end_denoise_level;

    bool echo_cancellation_enable;
    char *echo_name;

    bool front_end_resample_enable;
    unsigned int front_end_sample_rate;

    bool back_end_resample_enable;
    unsigned int back_end_sample_rate;

    bool channel_number_convert_enable;
    unsigned int channel_number;

    bool nn_mixing_enable;
    bool file_mode_app;

    APPFilterParameters():
        vad_enable(0),
        vad_prob_start_value(0),
        agc_enable(0),
        agc_level_value(8000),
        front_end_denoise_enable(0),
        front_end_denoise_level(15),
        back_end_denoise_enable(0),
        back_end_denoise_level(15),
        echo_cancellation_enable(0),
        echo_name(0),
        front_end_resample_enable(0),
        front_end_sample_rate(16000),
        back_end_resample_enable(0),
        back_end_sample_rate(16000),
        channel_number_convert_enable(0),
        channel_number(2),
        nn_mixing_enable(0),
        file_mode_app(0) {
    };
} APPFilterParameters;

#endif